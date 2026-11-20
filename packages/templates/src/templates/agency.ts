import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultAgencyContent: SiteContent = {
  template_id: 'agency',
  theme: {
    primary: '#4f46e5',
    accent: '#06b6d4',
    font: 'Inter',
    logo_url: null,
  },
  seo: {
    title: 'Vanguard Digital - Performance Growth & Product Engineering',
    description: 'We scale high-growth startups with conversion-obsessed engineering, paid acquisition, and brand design.',
  },
  contact_actions: {
    enable_whatsapp: true,
    whatsapp_number: '+15557890123',
    enable_call: false,
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'We engineer breakout growth for tomorrow\'s market leaders.',
      subhead: 'Data-driven product strategy, rapid software development, and growth marketing unified under one agile team.',
      cta_label: 'Book Discovery Call',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    },
    features: {
      enabled: true,
      items: [
        { title: 'Full-Stack Engineering', text: 'Edge-native web and mobile applications built for sub-second performance and unlimited scale.' },
        { title: 'Growth & Funnel Optimization', text: 'Rigorous conversion rate optimization (CRO) that turns traffic into high-retention revenue.' },
        { title: 'Brand & UX Architecture', text: 'Premium visual identity systems that build market authority and command premium pricing.' },
      ],
    },
    pricing: {
      enabled: true,
      plans: [
        {
          name: 'Sprint Kickstart',
          price: '$3,500',
          period: '/sprint',
          features: ['Single Core Feature Build', 'UI/UX Design Mockups', 'Production Deployment', '2 Weeks Turnaround'],
          cta_label: 'Start Sprint',
          cta_url: '#contact',
          highlighted: false,
        },
        {
          name: 'Growth Dedicated',
          price: '$7,500',
          period: '/month',
          features: ['Full-Time Senior Engineer', 'Weekly Strategy & CRO Sprints', 'Priority 24/7 Slack Support', 'Unlimited Code Reviews'],
          cta_label: 'Scale With Us',
          cta_url: '#contact',
          highlighted: true,
        },
        {
          name: 'Enterprise Advisory',
          price: 'Custom',
          period: '',
          features: ['Architecture Audit & Modernization', 'Dedicated Squad & Lead Architect', 'Custom SLA & Compliance', 'Executive Growth Sprints'],
          cta_label: 'Contact Advisory',
          cta_url: '#contact',
          highlighted: false,
        },
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        { quote: 'Vanguard helped us 3x our MRR within 6 months of launching our revised product. Invaluable partners.', author: 'Rachel Zhao', role: 'CEO at CloudMatrix' },
      ],
    },
    contact: {
      enabled: true,
      email: 'partners@vanguardgrowth.io',
      phone: '+1 (555) 789-0123',
      address: 'Tech District, Suite 400, New York, NY',
      form_enabled: true,
    },
  },
};

export function renderAgencyTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, features, pricing, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Vanguard');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${features?.enabled ? '<a href="#solutions">Services</a>' : ''}
        ${pricing?.enabled ? '<a href="#pricing">Pricing</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Get In Touch</a>
      </nav>
    </div>
  </header>
  `;

  // Hero
  if (hero.enabled) {
    body += `
    <section style="padding: 90px 0 70px; background: #0f172a; color: white;">
      <div class="container grid grid-2" style="align-items: center; gap: 50px;">
        <div>
          <span style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background: rgba(79,70,229,0.3); color: #818cf8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px;">
            DIGITAL INNOVATION PARTNERS
          </span>
          <h1 style="font-size: 44px; font-weight: 800; line-height: 1.15; margin-bottom: 24px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #94a3b8; line-height: 1.6; margin-bottom: 34px;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#solutions" class="btn-outline" style="border-color: #475569; color: #ffffff;">Our Capabilities</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div>
                <img src="${escapeHtml(hero.image_url)}" alt="Agency Team" style="border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); width: 100%; object-fit: cover; max-height: 440px;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  // Features / Services
  if (features?.enabled && features.items.length > 0) {
    body += `
    <section id="solutions" style="padding: 90px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">End-to-End Execution</h2>
          <p style="color: #64748b;">We integrate strategy, design, and engineering into cohesive delivery sprints.</p>
        </div>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
              <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${escapeHtml(f.title)}</h3>
              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">${escapeHtml(f.text)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Pricing Table
  if (pricing?.enabled && pricing.plans.length > 0) {
    body += `
    <section id="pricing" style="padding: 90px 0; background: #f8fafc;">
      <div class="container">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 50px;">
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Predictable Pricing</h2>
          <p style="color: #64748b;">No open-ended hourly billing. Clear scope, timeline, and deliverables.</p>
        </div>
        <div class="grid grid-3" style="align-items: center;">
          ${pricing.plans
            .map(
              (plan) => `
            <div style="background: #ffffff; border-radius: 16px; padding: 36px; border: ${plan.highlighted ? '2px solid var(--primary)' : '1px solid #e2e8f0'}; box-shadow: ${plan.highlighted ? '0 20px 25px -5px rgba(79,70,229,0.1)' : 'none'}; position: relative;">
              ${plan.highlighted ? '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 9999px;">MOST POPULAR</div>' : ''}
              <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${escapeHtml(plan.name)}</h3>
              <div style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 24px;">
                ${escapeHtml(plan.price)} <span style="font-size: 14px; color: #64748b; font-weight: 500;">${escapeHtml(plan.period)}</span>
              </div>
              <ul style="list-style: none; margin-bottom: 30px; display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: #334155;">
                ${plan.features.map((f) => `<li>✓ ${escapeHtml(f)}</li>`).join('')}
              </ul>
              <a href="${escapeHtml(plan.cta_url)}" class="${plan.highlighted ? 'btn-primary' : 'btn-outline'}" style="display: block; text-align: center;">${escapeHtml(plan.cta_label)}</a>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonials
  if (testimonials?.enabled && testimonials.items.length > 0) {
    body += `
    <section id="reviews" style="padding: 80px 0; background: #ffffff;">
      <div class="container" style="max-width: 800px; text-align: center;">
        <div style="font-size: 24px; color: #f59e0b; margin-bottom: 20px;">★★★★★</div>
        ${testimonials.items
          .map(
            (t) => `
          <blockquote style="font-size: 20px; font-weight: 600; color: #1e293b; line-height: 1.6; margin-bottom: 20px;">
            "${escapeHtml(t.quote)}"
          </blockquote>
          <div style="font-weight: 800; color: #0f172a; font-size: 15px;">${escapeHtml(t.author)}</div>
          ${t.role ? `<div style="font-size: 13px; color: #64748b;">${escapeHtml(t.role)}</div>` : ''}
        `
          )
          .join('')}
      </div>
    </section>
    `;
  }

  // Contact
  if (contact.enabled) {
    const turnstileWidget = options?.turnstileSiteKey
      ? `<div class="cf-turnstile" data-sitekey="${options.turnstileSiteKey}" style="margin-bottom: 16px;"></div>`
      : '';

    body += `
    <section id="contact" style="padding: 90px 0;">
      <div class="container grid grid-2" style="gap: 50px; align-items: start;">
        <div>
          <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Let's build something great.</h2>
          <p style="color: #64748b; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
            Ready to accelerate your product trajectory? Submit your project overview and our team will get back to you within 24 hours.
          </p>
          <div style="font-size: 14px; color: #334155; display: flex; flex-direction: column; gap: 12px;">
            <div><strong>Direct Contact:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>
            ${contact.phone ? `<div><strong>Phone:</strong> ${escapeHtml(contact.phone)}</div>` : ''}
            ${contact.address ? `<div><strong>Office:</strong> ${escapeHtml(contact.address)}</div>` : ''}
          </div>
        </div>

        ${
          contact.form_enabled
            ? `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 20px;">Schedule Consultation</h3>
          <form onsubmit="submitContactForm(event, '${escapeHtml(options?.slug || '')}')">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" required class="form-control" placeholder="Sarah Connor" />
            </div>
            <div class="form-group">
              <label>Work Email *</label>
              <input type="email" name="email" required class="form-control" placeholder="sarah@company.com" />
            </div>
            <div class="form-group">
              <label>Phone / WhatsApp</label>
              <input type="tel" name="phone" class="form-control" placeholder="+1 (555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Project Scope & Timeline *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="Briefly describe your objectives..."></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Submit Inquiry</button>
          </form>
        </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  body += `
  <footer class="site-footer">
    <div class="container">
      <div>© ${new Date().getFullYear()} ${brandName}. High-Velocity Engineering.</div>
      <div>
        <div class="studio-credit">
          <span class="studio-credit__pulse" aria-hidden="true"></span>
          <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 700;">Designed by</span>
          <a href="https://growthmachinestudio.com/" target="_blank" rel="noopener noreferrer" style="font-weight: 700; color: #0f172a;" aria-label="Designed by GrowthMachine Studio">
            GrowthMachine Studio
          </a>
        </div>
      </div>
    </div>
  </footer>
  `;

  return renderDocument({
    theme: content.theme,
    seo: content.seo,
    contactActions: content.contact_actions,
    aiChat: content.ai_chat,
    hideBadge: content.hide_badge,
    contentHtml: body,
    slug: options?.slug,
    turnstileSiteKey: options?.turnstileSiteKey,
  });
}

export const agencyTemplate: TemplateDefinition = {
  id: 'agency',
  name: 'Modern Agency & Startup',
  description: 'Clean SaaS & agency starter featuring capabilities, interactive pricing tables, and project booking.',
  thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
  category: 'agency',
  defaultContent: defaultAgencyContent,
  render: renderAgencyTemplate,
};
