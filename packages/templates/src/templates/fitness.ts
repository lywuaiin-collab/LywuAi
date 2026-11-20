import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultFitnessContent: SiteContent = {
  template_id: 'fitness',
  theme: {
    primary: '#dc2626',
    accent: '#f97316',
    font: 'Inter',
    logo_url: null,
  },
  seo: {
    title: 'Iron Forge Fitness - Strength & Conditioning Gym',
    description: 'High-intensity strength training, conditioning, and personal coaching. Join our community and transform your body.',
  },
  contact_actions: {
    enable_whatsapp: true,
    whatsapp_number: '+15554567890',
    enable_call: true,
    call_number: '+15554567890',
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Forge Strength. Build Legacy.',
      subhead: 'Elite strength and conditioning coaching in a supportive community gym. Personal training and group classes for all levels.',
      cta_label: 'Start Free Trial',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    },
    features: {
      enabled: true,
      items: [
        {
          title: 'Certified Coaches',
          text: 'Experienced trainers with certifications in strength, conditioning, and nutrition.',
        },
        {
          title: 'Small Group Classes',
          text: 'High-energy group sessions with personalized attention in every class.',
        },
        {
          title: '24/7 Member Access',
          text: 'Key-fob access to the gym anytime, any day of the week.',
        },
      ],
    },
    gallery: {
      enabled: true,
      image_urls: [
        'https://images.unsplash.com/photo-1517836357463-d25dfea3440a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581009146145-b4ef95046f33?auto=format&fit=crop&w=600&q=80',
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        {
          quote: 'In 3 months I lost 25 pounds and gained strength I never thought possible. Life-changing.',
          author: 'Mike Torres',
          role: 'Member',
        },
        {
          quote: 'The coaches know their stuff and the community keeps me coming back every day.',
          author: 'Jessica Lee',
          role: 'Member',
        },
      ],
    },
    contact: {
      enabled: true,
      email: 'info@ironforgefitness.com',
      phone: '(555) 456-7890',
      address: '500 Iron Way, Industrial District, Metro City',
      hours: 'Mon - Fri: 5:00 AM - 10:00 PM | Sat - Sun: 7:00 AM - 8:00 PM',
      form_enabled: true,
    },
  },
};

export function renderFitnessTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, features, gallery, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Iron Forge Fitness');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${features?.enabled ? '<a href="#services">Classes</a>' : ''}
        ${gallery?.enabled ? '<a href="#gallery">Facility</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Results</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Join Now</a>
      </nav>
    </div>
  </header>
  `;

  if (hero.enabled) {
    body += `
    <section style="padding: 70px 0; background: linear-gradient(180deg, #1c1917 0%, #0f0a00 100%); color: #ffffff;">
      <div class="container grid grid-2" style="align-items: center;">
        <div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(220,38,38,0.15); color: var(--primary); font-size: 12px; font-weight: 700; margin-bottom: 16px;">
            STRENGTH & CONDITIONING
          </span>
          <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; color: #ffffff; margin-bottom: 20px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #e2e8f0; margin-bottom: 30px; line-height: 1.6;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#contact" class="btn-outline">Schedule Tour</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div>
                <img src="${escapeHtml(hero.image_url)}" alt="Gym Hero" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); width: 100%; object-fit: cover; max-height: 420px;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  if (features?.enabled && features.items.length > 0) {
    body += `
    <section id="services" style="padding: 80px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">Why Train With Us</h2>
          <p style="color: #94a3b8;">Results-driven training for every body and every goal.</p>
        </div>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 32px; transition: transform 0.2s, box-shadow 0.2s;">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(220,38,38,0.15); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 20px;">💪</div>
              <h3 style="font-size: 19px; font-weight: 700; color: #ffffff; margin-bottom: 10px;">${escapeHtml(f.title)}</h3>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">${escapeHtml(f.text)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
    `;
  }

  if (gallery?.enabled && gallery.image_urls.length > 0) {
    body += `
    <section id="gallery" style="padding: 80px 0; background: #1c1917; color: #ffffff;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">The Forge</h2>
          <p style="color: #94a3b8;">State-of-the-art equipment and training space.</p>
        </div>
        <div class="grid grid-3">
          ${gallery.image_urls
            .map(
              (url) => `
            <div style="border-radius: 14px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
              <img src="${escapeHtml(url)}" alt="Gym Facility" style="width: 100%; height: 260px; object-fit: cover; display: block;" />
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
    <section id="reviews" style="padding: 80px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">Member Results</h2>
          <p style="color: #94a3b8;">Real transformations from our community.</p>
        </div>
        <div class="grid grid-2">
          ${testimonials.items
            .map(
              (t) => `
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 30px;">
              <div style="color: #f97316; margin-bottom: 14px;">★★★★★</div>
              <p style="font-size: 15px; color: #e2e8f0; font-style: italic; margin-bottom: 16px;">"${escapeHtml(t.quote)}"</p>
              <div style="font-weight: 700; color: #ffffff; font-size: 14px;">${escapeHtml(t.author)}</div>
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
    <section id="contact" style="padding: 80px 0; background: #1c1917; color: #ffffff;">
      <div class="container grid grid-2" style="gap: 50px; align-items: start;">
        <div>
          <h2 style="font-size: 34px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">Join the Forge</h2>
          <p style="color: #94a3b8; margin-bottom: 30px; font-size: 16px;">
            Ready to transform? Send us a message or stop by for a tour.
          </p>
          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; color: #e2e8f0;">
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary);">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>` : ''}
            ${contact.address ? `<div><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Gym Hours:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
          </div>
        </div>
        ${
          contact.form_enabled
            ? `
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px;">
          <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 20px;">Start Your Free Trial</h3>
          <form onsubmit="submitContactForm(event, '${escapeHtml(options?.slug || '')}')">
            <div class="form-group">
              <label>Your Name *</label>
              <input type="text" name="name" required class="form-control" placeholder="Mike Johnson" />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required class="form-control" placeholder="mike@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" class="form-control" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Fitness Goal *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="e.g. Build strength, lose weight, train for marathon"></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Claim Free Trial</button>
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

export const fitnessTemplate: TemplateDefinition = {
  id: 'fitness',
  name: 'Gym & Fitness Studio',
  description: 'Energetic starter for fitness studios, personal trainers, and strength gyms.',
  thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
  category: 'fitness',
  defaultContent: defaultFitnessContent,
  render: renderFitnessTemplate,
};
