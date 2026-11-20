import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultLawyerContent: SiteContent = {
  template_id: 'lawyer',
  theme: {
    primary: '#1e3a5f',
    accent: '#c9a84c',
    font: 'Inter',
    logo_url: null,
  },
  seo: {
    title: 'Sterling & Associates - Experienced Legal Counsel',
    description: 'Trusted legal representation for business law, estate planning, and family matters. Free initial consultation.',
  },
  contact_actions: {
    enable_whatsapp: false,
    enable_call: true,
    call_number: '+15555678901',
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Trusted Legal Counsel When It Matters Most',
      subhead: 'Experienced attorneys providing strategic guidance in business law, estate planning, and family law.',
      cta_label: 'Request Consultation',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1589829085413-56d8cb25887c?auto=format&fit=crop&w=1200&q=80',
    },
    features: {
      enabled: true,
      items: [
        {
          title: 'Business & Corporate Law',
          text: 'Entity formation, contracts, mergers, and ongoing legal counsel for growing businesses.',
        },
        {
          title: 'Estate Planning',
          text: 'Wills, trusts, probate, and comprehensive estate strategies to protect your legacy.',
        },
        {
          title: 'Family Law',
          text: 'Compassionate representation for divorce, custody, and family legal matters.',
        },
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        {
          quote: 'Sterling & Associates handled our complex business matter with exceptional skill and professionalism.',
          author: 'Rachel Monroe',
          role: 'CEO, Apex Ventures',
        },
        {
          quote: 'Knowledgeable, responsive, and genuinely caring. They made a stressful process manageable.',
          author: 'James Whitaker',
          role: 'Client',
        },
      ],
    },
    contact: {
      enabled: true,
      email: 'partners@sterlinglaw.com',
      phone: '+1 (555) 567-8901',
      address: '400 Justice Tower, Suite 1500, New York, NY',
      hours: 'Mon - Fri: 8:30 AM - 5:30 PM',
      form_enabled: true,
    },
  },
};

export function renderLawyerTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, features, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Sterling & Associates');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${features?.enabled ? '<a href="#practice">Practice Areas</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Client Reviews</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Contact Us</a>
      </nav>
    </div>
  </header>
  `;

  if (hero.enabled) {
    body += `
    <section style="padding: 70px 0; background: linear-gradient(180deg, #faf9f7 0%, #ffffff 100%);">
      <div class="container grid grid-2" style="align-items: center;">
        <div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(30,58,95,0.1); color: var(--primary); font-size: 12px; font-weight: 700; margin-bottom: 16px;">
            ESTABLISHED LEGAL COUNSEL
          </span>
          <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; color: #0f172a; margin-bottom: 20px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #475569; margin-bottom: 30px; line-height: 1.6;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#contact" class="btn-outline">Office Hours</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div>
                <img src="${escapeHtml(hero.image_url)}" alt="Law Firm Hero" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; object-fit: cover; max-height: 420px;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  if (features?.enabled && features.items.length > 0) {
    body += `
    <section id="practice" style="padding: 80px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Practice Areas</h2>
          <p style="color: #64748b;">Strategic legal solutions tailored to your needs.</p>
        </div>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 32px; border-top: 3px solid #c9a84c; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(30,58,95,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 20px;">⚖️</div>
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

  if (testimonials?.enabled && testimonials.items.length > 0) {
    body += `
    <section id="reviews" style="padding: 80px 0; background: #f8fafc;">
      <div class="container">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Client Testimonials</h2>
          <p style="color: #64748b;">Trusted by individuals and businesses alike.</p>
        </div>
        <div class="grid grid-2">
          ${testimonials.items
            .map(
              (t) => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div style="color: #c9a84c; margin-bottom: 14px;">★★★★★</div>
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

  if (contact.enabled) {
    const turnstileWidget = options?.turnstileSiteKey
      ? `<div class="cf-turnstile" data-sitekey="${options.turnstileSiteKey}" style="margin-bottom: 16px;"></div>`
      : '';

    body += `
    <section id="contact" style="padding: 80px 0;">
      <div class="container grid grid-2" style="gap: 50px; align-items: start;">
        <div>
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Schedule Consultation</h2>
          <p style="color: #64748b; margin-bottom: 30px; font-size: 16px;">
            Have a legal question? Send us a message to arrange a confidential consultation.
          </p>
          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; color: #334155;">
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary);">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>` : ''}
            ${contact.address ? `<div><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Office Hours:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
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
              <label>Legal Matter *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="Briefly describe your legal issue..."></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Request Consultation</button>
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

export const lawyerTemplate: TemplateDefinition = {
  id: 'lawyer',
  name: 'Law Firm & Legal Services',
  description: 'Professional starter for attorneys, law firms, and legal consultants.',
  thumbnail: 'https://images.unsplash.com/photo-1589829085413-56d8cb25887c?auto=format&fit=crop&w=600&q=80',
  category: 'lawyer',
  defaultContent: defaultLawyerContent,
  render: renderLawyerTemplate,
};
