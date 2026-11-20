import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultSalonContent: SiteContent = {
  template_id: 'salon',
  theme: {
    primary: '#701a75',
    accent: '#f472b6',
    font: 'Outfit',
    logo_url: null,
  },
  seo: {
    title: 'Glow Beauty Studio - Professional Salon & Spa Services',
    description: 'Premium beauty treatments, hair styling, skincare, and nail services. Book your appointment today.',
  },
  contact_actions: {
    enable_whatsapp: true,
    whatsapp_number: '+15552345678',
    enable_call: true,
    call_number: '+15552345678',
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Radiant Beauty Starts Here',
      subhead: 'Luxury hair, skin, and nail treatments in a relaxing, modern studio. Expert stylists dedicated to your glow.',
      cta_label: 'Book Appointment',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    },
    features: {
      enabled: true,
      items: [
        {
          title: 'Hair Styling & Color',
          text: 'Precision cuts, balayage, highlights, and complete color transformations by certified colorists.',
        },
        {
          title: 'Skincare & Facials',
          text: 'Customized facial treatments for every skin type using premium organic products.',
        },
        {
          title: 'Nail Art & Manicure',
          text: 'Elegant manicures, pedicures, and nail art designs that make your hands look stunning.',
        },
      ],
    },
    gallery: {
      enabled: true,
      image_urls: [
        'https://images.unsplash.com/photo-1522335789203-7d102b030237?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1541037714113-60c73b3189c7?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1560066761-fd3ef86eae93?auto=format&fit=crop&w=600&q=80',
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        {
          quote: 'The best salon I have ever been to. My hair has never looked this good!',
          author: 'Emma Rodriguez',
          role: 'Client',
        },
        {
          quote: 'Relaxing atmosphere, talented staff, and beautiful results every single visit.',
          author: 'Chloe Watson',
          role: 'Client',
        },
      ],
    },
    contact: {
      enabled: true,
      email: 'hello@glowbeauty.com',
      phone: '(555) 234-5678',
      address: '890 Glamour Avenue, Suite 100, Beverly Hills',
      hours: 'Tue - Sat: 9:00 AM - 7:00 PM',
      form_enabled: true,
    },
  },
};

export function renderSalonTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, features, gallery, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Glow Beauty');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${features?.enabled ? '<a href="#services">Services</a>' : ''}
        ${gallery?.enabled ? '<a href="#gallery">Gallery</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Reviews</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Book Now</a>
      </nav>
    </div>
  </header>
  `;

  if (hero.enabled) {
    body += `
    <section style="padding: 70px 0; background: linear-gradient(180deg, #fdf2f8 0%, #ffffff 100%);">
      <div class="container grid grid-2" style="align-items: center;">
        <div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(112,26,117,0.1); color: var(--primary); font-size: 12px; font-weight: 700; margin-bottom: 16px;">
            LUXURY BEAUTY STUDIO
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
                <img src="${escapeHtml(hero.image_url)}" alt="Salon Hero" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; object-fit: cover; max-height: 420px;" />
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
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Our Signature Services</h2>
          <p style="color: #64748b;">Expert treatments designed to enhance your natural beauty.</p>
        </div>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="background: #ffffff; border: 1px solid #f5d0fe; border-radius: 14px; padding: 32px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(112,26,117,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 20px;">✨</div>
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

  if (gallery?.enabled && gallery.image_urls.length > 0) {
    body += `
    <section id="gallery" style="padding: 80px 0; background: #f8fafc;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Our Work</h2>
          <p style="color: #64748b;">Stunning transformations from our studio.</p>
        </div>
        <div class="grid grid-3">
          ${gallery.image_urls
            .map(
              (url) => `
            <div style="border-radius: 14px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <img src="${escapeHtml(url)}" alt="Salon Work" style="width: 100%; height: 260px; object-fit: cover; display: block;" />
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
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Client Love</h2>
          <p style="color: #64748b;">Real results from our happy clients.</p>
        </div>
        <div class="grid grid-2">
          ${testimonials.items
            .map(
              (t) => `
            <div style="background: #ffffff; border: 1px solid #f5d0fe; border-radius: 16px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div style="color: #f472b6; margin-bottom: 14px;">★★★★★</div>
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
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Book Your Visit</h2>
          <p style="color: #64748b; margin-bottom: 30px; font-size: 16px;">
            Ready to glow? Send us a message or reach out directly.
          </p>
          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; color: #334155;">
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary);">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>` : ''}
            ${contact.address ? `<div><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Salon Hours:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
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
              <input type="text" name="name" required class="form-control" placeholder="Jane Smith" />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required class="form-control" placeholder="jane@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" class="form-control" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Service of Interest *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="e.g. Balayage + Facial for Saturday"></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Request Appointment</button>
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

export const salonTemplate: TemplateDefinition = {
  id: 'salon',
  name: 'Beauty Salon & Spa',
  description: 'Elegant starter for hair salons, beauty studios, nail bars, and spas.',
  thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  category: 'salon',
  defaultContent: defaultSalonContent,
  render: renderSalonTemplate,
};
