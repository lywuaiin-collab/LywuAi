import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { templates, getTemplate } from '@lywuai/templates';
import { authRoutes } from './routes/auth';
import { siteRoutes } from './routes/sites';
import { mediaRoutes } from './routes/media';
import { aiRoutes } from './routes/ai';
import { submissionRoutes } from './routes/submissions';
import { paymentRoutes } from './routes/payments';
import { supportRoutes } from './routes/support';
import type { Env, HonoVariables } from './types';
import type { SiteContent } from '@lywuai/shared';

const app = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Global CORS Middleware (Prevents "Failed to fetch" on preflight OPTIONS and cross-port dev calls)
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Filename', 'Cookie'],
    credentials: true,
  })
);

// Global Error Handler (Prevents abrupt connection terminations that cause "Failed to fetch")
app.onError((err, c) => {
  console.error('[Worker Error]', err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

// Mount API sub-routers
app.route('/api/auth', authRoutes);
app.route('/api/sites', siteRoutes);
app.route('/api', mediaRoutes); // handles /media/:id and /api/sites/:id/media
app.route('/api', aiRoutes); // handles /api/generate
app.route('/api', submissionRoutes); // handles /api/sites/:slug/submissions
app.route('/api/payments', paymentRoutes); // handles /api/payments/*
app.route('/api/support', supportRoutes); // handles /api/support/ticket

// Public template catalog
app.get('/api/templates', (c) => {
  return c.json({
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      thumbnail: t.thumbnail,
      category: t.category,
      defaultContent: t.defaultContent,
    })),
  });
});

// Fallback server-side preview renderer for iframe
app.post('/api/preview', async (c) => {
  try {
    const { content } = await c.req.json<{ content: SiteContent }>();
    if (!content || !content.template_id) {
      return c.text('Invalid preview content', 400);
    }
    const template = getTemplate(content.template_id);
    const html = template.render(content, {
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      slug: 'preview',
    });
    return c.html(html);
  } catch (err: any) {
    return c.text('Preview rendering error: ' + err.message, 500);
  }
});

// Public AI Receptionist Chat for Published Websites: POST /api/public/chat/:slug
app.post('/api/public/chat/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const { message } = await c.req.json<{ message: string }>();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Rate Limiting by Client IP (Max 15 questions per hour per IP to prevent abuse)
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'anon';
    const hourKey = `public_chat:${slug}:${clientIp}:${new Date().toISOString().substring(0, 13)}`;

    const limit = await c.env.DB.prepare('SELECT count FROM rate_limits WHERE key = ?')
      .bind(hourKey)
      .first<{ count: number }>();

    if ((limit?.count || 0) >= 15) {
      return c.json({
        reply: 'You have reached the chat limit for this hour. For immediate help, please call us directly or click the WhatsApp button!',
      });
    }

    // Fetch site data & owner subscription status from D1
    const site = await c.env.DB.prepare(
      `SELECT s.content_json, s.published_content_json, sub.status AS sub_status, sub.plan AS sub_plan
       FROM sites s
       LEFT JOIN subscriptions sub ON s.owner_id = sub.owner_id
       WHERE s.slug = ? AND s.status = 'published'`
    )
      .bind(slug)
      .first<{ content_json: string; published_content_json?: string; sub_status?: string; sub_plan?: string }>();

    if (!site) {
      return c.json({ error: 'Website not found' }, 404);
    }

    const content: SiteContent = JSON.parse(site.published_content_json || site.content_json);

    // Verify AI Chat is enabled
    if (!content.ai_chat?.enabled) {
      return c.json({ error: 'AI Receptionist is not enabled on this website.' }, 403);
    }

    const brandName = content.seo.title.split('-')[0].trim() || 'Our Business';
    const botName = content.ai_chat.bot_name || `${brandName} Assistant`;

    // Construct context from website data
    const servicesList = (content.sections.features?.items || [])
      .map((f) => `- ${f.title}: ${f.text}`)
      .join('\n');

    const contactInfo = [
      content.sections.contact.phone ? `Phone: ${content.sections.contact.phone}` : null,
      content.sections.contact.email ? `Email: ${content.sections.contact.email}` : null,
      content.sections.contact.address ? `Address: ${content.sections.contact.address}` : null,
      content.sections.contact.hours ? `Business Hours: ${content.sections.contact.hours}` : null,
      content.contact_actions?.enable_whatsapp && content.contact_actions.whatsapp_number
        ? `WhatsApp: ${content.contact_actions.whatsapp_number}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are ${botName}, the polite and helpful 24/7 AI Receptionist for ${brandName}.
Your job is to assist visitors, answer questions about our business, and guide them to become customers.

BUSINESS DETAILS:
- Name: ${brandName}
- About: ${content.seo.description}
${servicesList ? `\nOUR SERVICES & OFFERINGS:\n${servicesList}` : ''}
${contactInfo ? `\nCONTACT & LOCATION:\n${contactInfo}` : ''}

RULES:
1. Always be polite, warm, and concise (1 to 3 sentences maximum).
2. Answer based ONLY on the provided business details. If you do not know a specific detail (like exact custom pricing), warmly invite the visitor to call or WhatsApp us.
3. Suggest the WhatsApp button or calling whenever someone wants to book, order, or discuss a project.`;

    const model = c.env.OPENROUTER_MODEL || 'openrouter/free';

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `https://lywuai.workers.dev/s/${slug}`,
        'X-Title': `${brandName} AI Receptionist`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.substring(0, 500) },
        ],
        temperature: 0.6,
        max_tokens: 250,
      }),
    });

    if (!res.ok) {
      return c.json({
        reply: "Thank you for asking! For quick assistance, please reach out via our WhatsApp or phone button.",
      });
    }

    const data: any = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Thank you for contacting us! How else can I help you today?";

    // Record rate limit
    await c.env.DB.prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET count = count + 1`
    ).bind(hourKey).run();

    return c.json({ reply });
  } catch (err: any) {
    return c.json({
      reply: "We're here to help! Please call us or click the WhatsApp button to chat directly.",
    });
  }
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    runtime: 'Cloudflare Edge',
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Public Website Serving: GET /s/:slug
app.get('/s/:slug', async (c) => {
  const slug = c.req.param('slug');

  // 1. Check Cloudflare Edge Cache
  const cacheKey = new Request(c.req.url, c.req.raw);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query published snapshot from D1
  const site = await c.env.DB.prepare(
    "SELECT published_html, status FROM sites WHERE slug = ? AND status = 'published'"
  )
    .bind(slug)
    .first<{ published_html: string; status: string }>();

  if (!site || !site.published_html) {
    return c.html(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Site Not Found - LywuAi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
          .card { background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; max-width: 440px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          h1 { font-size: 24px; margin-bottom: 12px; }
          p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
          a { background: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Website Not Found or Unpublished</h1>
          <p>The website at <code>/s/${slug}</code> has not been published yet or does not exist.</p>
          <a href="/">Create Your Own Website on LywuAi</a>
        </div>
      </body>
      </html>`,
      404
    );
  }

  const response = new Response(site.published_html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  });

  // Store snapshot in Cloudflare edge cache
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
});

// ─────────────────────────────────────────
// Razorpay & RBI Compliance Policy Pages (Crawler & Direct URLs)
// ─────────────────────────────────────────
function renderPolicyPage(title: string, bodyContent: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — LywuAi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 820px; margin: 40px auto; padding: 0 20px; background: #f8fafc; }
    .card { background: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    h1 { font-size: 26px; color: #0f172a; margin-top: 0; }
    h2 { font-size: 16px; color: #0f172a; margin-top: 24px; font-weight: 700; }
    p, li { font-size: 14px; color: #475569; }
    a { color: #2563eb; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    .nav { margin-bottom: 24px; font-size: 13px; font-weight: 600; }
    .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .badge { display: inline-block; padding: 4px 10px; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; border-radius: 999px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="nav"><a href="/">← Return to LywuAi Home</a></div>
    <span class="badge">Legal &amp; Merchant Compliance</span>
    ${bodyContent}
    <div class="footer">
      <p>© ${new Date().getFullYear()} LywuAi (https://lywuai.com). Launched with GrowthMachine Studio. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="/terms">Terms of Service</a> &bull; 
        <a href="/privacy">Privacy Policy</a> &bull; 
        <a href="/refund">Refund Policy</a> &bull; 
        <a href="/shipping">Shipping Policy</a> &bull; 
        <a href="/contact">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// Terms of Service
app.get('/terms', () => {
  return renderPolicyPage(
    'Terms of Service',
    `<h1>Terms of Service</h1>
    <p>Last updated: November 2026</p>
    <h2>1. Overview</h2>
    <p>Welcome to LywuAi (&quot;Service&quot;, &quot;Platform&quot;), available at https://lywuai.com. LywuAi provides AI-assisted website generation, static cloud hosting, lead capture forms, WhatsApp action buttons, and AI customer receptionists for entrepreneurs and small businesses.</p>
    <h2>2. Account Registration &amp; Security</h2>
    <p>To use our services, you must register with a valid email address and password. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
    <h2>3. 100% Free Service &amp; Fair Use</h2>
    <p>LywuAi provides 100% free website building, high-speed cloud hosting, WhatsApp CTAs, 24/7 AI Receptionist, and custom domain connection for all registered accounts. Custom bespoke website development is available separately through GrowthMachine Studio.</p>
    <h2>4. Permissible Use &amp; Content Guidelines</h2>
    <p>You agree not to use LywuAi to build or host websites containing fraudulent, defamatory, adult, infringing, or illegal material violating Indian laws (including the Information Technology Act, 2000) or international internet standards. Violation will result in immediate account suspension.</p>
    <h2>5. Termination &amp; Governing Law</h2>
    <p>We reserve the right to suspend or terminate services for terms violation. These terms are governed by the laws of India.</p>`
  );
});
app.get('/terms-and-conditions', (c) => c.redirect('/terms', 301));

// Privacy Policy
app.get('/privacy', () => {
  return renderPolicyPage(
    'Privacy Policy',
    `<h1>Privacy Policy</h1>
    <p>Last updated: November 2026</p>
    <h2>1. Information We Collect</h2>
    <p>We collect personal information necessary to deliver our services, including your name, email address, salted password hashes, website contents, and support ticket submissions.</p>
    <h2>2. Payment Information Security</h2>
    <p>All online payment transactions are processed through <strong>Razorpay Software Private Limited</strong> using 256-bit SSL encryption. LywuAi does NOT store or process your credit/debit card numbers, CVVs, or UPI PINs on our servers.</p>
    <h2>3. How We Use Your Data</h2>
    <p>Your information is used to authenticate users, manage cloud hosting, deliver AI copy generation, send account notifications, and provide customer support. We never sell, rent, or trade user data to third parties.</p>
    <h2>4. Contacting Us About Privacy</h2>
    <p>If you have any questions or data deletion requests, contact our privacy officer at <a href="mailto:support@lywuai.com">support@lywuai.com</a>.</p>`
  );
});
app.get('/privacy-policy', (c) => c.redirect('/privacy', 301));

// Refund & Cancellation Policy
app.get('/refund', () => {
  return renderPolicyPage(
    'Refund & Cancellation Policy',
    `<h1>Refund &amp; Cancellation Policy</h1>
    <p>Last updated: November 2026</p>
    <h2>1. 7-Day Money-Back Guarantee</h2>
    <p>We are dedicated to customer satisfaction. If you are not satisfied with your LywuAi Pro or Business plan subscription, you are entitled to a full 100% refund within <strong>7 days</strong> of your initial purchase.</p>
    <h2>2. Subscription Cancellation</h2>
    <p>You may cancel your recurring monthly or yearly subscription at any time directly through the LywuAi dashboard. Upon cancellation, your service remains active until the end of the current paid billing cycle, and no further charges will be made.</p>
    <h2>3. Refund Processing Timeline</h2>
    <p>Once approved, refunds are credited back to your original source of payment (Bank account, UPI ID, or Credit/Debit Card) via Razorpay within <strong>5 to 7 business days</strong>.</p>
    <h2>4. How to Request a Refund</h2>
    <p>Email your refund request along with your registered email and payment ID to <a href="mailto:support@lywuai.com">support@lywuai.com</a> or raise a ticket directly in the dashboard.</p>`
  );
});
app.get('/refund-policy', (c) => c.redirect('/refund', 301));
app.get('/cancellation-policy', (c) => c.redirect('/refund', 301));

// Shipping & Delivery Policy
app.get('/shipping', () => {
  return renderPolicyPage(
    'Shipping & Delivery Policy',
    `<h1>Shipping &amp; Delivery Policy</h1>
    <p>Last updated: November 2026</p>
    <h2>1. 100% Digital SaaS Service</h2>
    <p>LywuAi provides online software as a service (SaaS) and digital website generation tools. <strong>No physical goods or tangible shipments are involved.</strong></p>
    <h2>2. Delivery Timeline</h2>
    <p>Access to all software features, subscription plans, AI tools, and hosting capabilities is delivered <strong>instantly and automatically</strong> upon successful sign-up and payment verification.</p>`
  );
});
app.get('/delivery-policy', (c) => c.redirect('/shipping', 301));

// Contact Us
app.get('/contact', () => {
  return renderPolicyPage(
    'Contact Us',
    `<h1>Contact Us</h1>
    <p>For support, billing inquiries, or grievance redressal, please reach out:</p>
    <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 20px;">
      <p style="margin: 6px 0;"><strong>Brand:</strong> LywuAi (Launch Your Website Using AI)</p>
      <p style="margin: 6px 0;"><strong>Parent Studio:</strong> GrowthMachine Studio</p>
      <p style="margin: 6px 0;"><strong>Support Email:</strong> <a href="mailto:support@lywuai.com">support@lywuai.com</a></p>
      <p style="margin: 6px 0;"><strong>Help Desk:</strong> Built-in 24/7 Support Ticket Center in the LywuAi Dashboard</p>
      <p style="margin: 6px 0;"><strong>Operating Location:</strong> India</p>
      <p style="margin: 6px 0;"><strong>Operating Hours:</strong> Monday &ndash; Saturday, 9:00 AM &ndash; 7:00 PM IST</p>
    </div>`
  );
});
app.get('/contact-us', (c) => c.redirect('/contact', 301));

// Custom Domain Resolution & Static Assets / SPA Fallback
app.all('*', async (c) => {
  const url = new URL(c.req.url);
  const host = url.hostname.toLowerCase();

  // If request is made via a custom domain (not lywuai.com, workers.dev, or localhost)
  if (
    host &&
    !host.includes('lywuai.com') &&
    !host.includes('.workers.dev') &&
    !host.includes('localhost') &&
    host !== '127.0.0.1' &&
    !url.pathname.startsWith('/api') &&
    !url.pathname.startsWith('/media')
  ) {
    const customSite = await c.env.DB.prepare(
      "SELECT published_html FROM sites WHERE custom_domain = ? AND status = 'published'"
    )
      .bind(host)
      .first<{ published_html: string }>();

    if (customSite?.published_html) {
      return new Response(customSite.published_html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=600, s-maxage=3600',
        },
      });
    }
  }

  if (c.env.ASSETS && typeof c.env.ASSETS.fetch === 'function') {
    return await c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('LywuAi Worker Ready (Static Assets binding active on deployment)', 200);
});

export default app;
