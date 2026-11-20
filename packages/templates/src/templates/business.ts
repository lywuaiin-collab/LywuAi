import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultBusinessContent: SiteContent = {
  template_id: 'business',
  theme: {
    primary: '#2563eb',
    accent: '#f59e0b',
    font: 'Inter',
    logo_url: null,
  },
  seo: {
    title: 'Apex Local Services - Trusted, Reliable & Professional',
    description: 'We provide premier local services with over 15 years of industry excellence. Book an appointment or call us today.',
  },
  contact_actions: {
    enable_whatsapp: true,
    whatsapp_number: '+15551234567',
    enable_call: true,
    call_number: '+15551234567',
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Trusted Local Service Professionals You Can Count On',
      subhead: 'Fast, certified, and fully insured experts ready to handle your needs with 100% satisfaction guaranteed.',
      cta_label: 'Book Service Now',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    },
    features: {
      enabled: true,
      items: [
        {
          title: 'Licensed & Insured',
          text: 'Complete peace of mind knowing all work is conducted by certified master technicians.',
        },
        {
          title: 'Upfront Transparent Pricing',
          text: 'No hidden charges or surprise invoices. Clear upfront quotes before any project starts.',
        },
        {
          title: 'Same-Day Response',
          text: 'Prompt scheduling and emergency availability whenever you need us most.',
        },
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        {
          quote: 'The team arrived on time, diagnosed the issue within minutes, and resolved it flawlessly. Highly recommend!',
          author: 'Sarah Jenkins',
          role: 'Homeowner',
        },
        {
          quote: 'Outstanding work ethic and unmatched attention to detail. They are our go-to team for everything.',
          author: 'Marcus Vance',
          role: 'Facility Manager',
        },
      ],
    },
    contact: {
      enabled: true,
      email: 'contact@apexservice.com',
      phone: '(555) 123-4567',
      address: '742 Evergreen Terrace, Springfield',
      hours: 'Mon - Fri: 8:00 AM - 6:00 PM',
      form_enabled: true,
    },
  },
};

export function renderBusinessTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, features, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Apex Service');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${features?.enabled ? '<a href="#services">Services</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Reviews</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Contact Us</a>
      </nav>
    </div>
  </header>
  `;

  // Hero Section
  if (hero.enabled) {
    body += `
    <section style="padding: 70px 0; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);">
      <div class="container grid grid-2" style="align-items: center;">
        <div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(37,99,235,0.1); color: var(--primary); font-size: 12px; font-weight: 700; margin-bottom: 16px;">
            VERIFIED LOCAL EXPERTS
          </span>
          <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; color: #0f172a; margin-bottom: 20px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #475569; margin-bottom: 30px; line-height: 1.6;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#contact" class="btn-outline">Inquire Today</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div>
                <img src="${escapeHtml(hero.image_url)}" alt="Local Services Hero" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; object-fit: cover; max-height: 420px;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  // Features / Services Section
  if (features?.enabled && features.items.length > 0) {
    body += `
    <section id="services" style="padding: 80px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Why Our Clients Trust Us</h2>
          <p style="color: #64748b;">Delivering excellence, punctuality, and lasting quality on every job.</p>
        </div>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 32px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(37,99,235,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 20px;">✓</div>
              <h3 style="font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">${escapeHtml(f.title)}</h3>
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

  // Testimonials Section
  if (testimonials?.enabled && testimonials.items.length > 0) {
    body += `
    <section id="reviews" style="padding: 80px 0; background: #f8fafc;">
      <div class="container">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">What Our Customers Say</h2>
          <p style="color: #64748b;">Real feedback from verified local clients.</p>
        </div>
        <div class="grid grid-2">
          ${testimonials.items
            .map(
              (t) => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div style="color: #f59e0b; margin-bottom: 14px;">★★★★★</div>
              <p style="font-size: 15px; color: #334155; font-style: italic; margin-bottom: 16px;">"${escapeHtml(t.quote)}"</p>
              <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${escapeHtml(t.author)}</div>
              ${t.role ? `<div style="font-size: 12px; color: #94a3b8;">${escapeHtml(t.role)}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Contact Section
  if (contact.enabled) {
    const turnstileWidget = options?.turnstileSiteKey
      ? `<div class="cf-turnstile" data-sitekey="${options.turnstileSiteKey}" style="margin-bottom: 16px;"></div>`
      : '';

    body += `
    <section id="contact" style="padding: 80px 0;">
      <div class="container grid grid-2" style="gap: 50px; align-items: start;">
        <div>
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Get In Touch</h2>
          <p style="color: #64748b; margin-bottom: 30px; font-size: 16px;">
            Have questions or need an estimate? Send us a message or reach out directly.
          </p>

          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; color: #334155;">
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary);">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>` : ''}
            ${contact.address ? `<div><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Business Hours:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
          </div>
        </div>

        ${
          contact.form_enabled
            ? `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 20px;">Send a Message</h3>
          <form onsubmit="submitContactForm(event, '${escapeHtml(options?.slug || '')}')">
            <div class="form-group">
              <label>Your Name *</label>
              <input type="text" name="name" required class="form-control" placeholder="John Doe" />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required class="form-control" placeholder="john@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" class="form-control" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label>How Can We Help? *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="Describe what you need..."></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Send Inquiry</button>
          </form>
        </div>
        `
            : ''
        }
      </div>
    </section>
    `;
  }

  body += `
  <footer class="site-footer">
    <div class="container">
      <div>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</div>
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

export const businessTemplate: TemplateDefinition = {
  id: 'business',
  name: 'Local Business & Services',
  description: 'High-converting starter for contractors, local technicians, consultants, and service providers.',
  thumbnail: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  category: 'business',
  defaultContent: defaultBusinessContent,
  render: renderBusinessTemplate,
};
