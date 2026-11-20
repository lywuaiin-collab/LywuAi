import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultFreelancerContent: SiteContent = {
  template_id: 'freelancer',
  theme: {
    primary: '#065f46',
    accent: '#34d399',
    font: 'Inter',
    logo_url: null,
  },
  seo: {
    title: 'Priya Sharma - Freelance Product Designer & Developer',
    description: 'Product design and frontend development for startups and creators. Clean, modern digital experiences built with care.',
  },
  contact_actions: {
    enable_whatsapp: false,
    enable_call: false,
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Designing Digital Products People Love',
      subhead: 'Freelance product designer and frontend developer creating clean, modern experiences for startups and creators worldwide.',
      cta_label: 'View My Work',
      cta_url: '#projects',
      image_url: 'https://images.unsplash.com/photo-1586718067103-70f43e28a2c1?auto=format&fit=crop&w=1200&q=80',
    },
    projects: {
      enabled: true,
      items: [
        {
          title: 'Nexa Finance Dashboard',
          description: 'A comprehensive financial analytics dashboard for small business owners.',
          tags: ['React', 'TypeScript', 'Figma'],
          link: 'https://example.com/nexa',
          image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        },
        {
          title: 'Bloom E-commerce',
          description: 'Minimalist online store with seamless checkout and product discovery.',
          tags: ['Next.js', 'Tailwind', 'Stripe'],
          link: 'https://example.com/bloom',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        },
        {
          title: 'Atlas Travel App',
          description: 'Travel planning mobile app with curated local experiences and offline maps.',
          tags: ['React Native', 'Node.js', 'Mapbox'],
          link: 'https://example.com/atlas',
          image_url: 'https://images.unsplash.com/photo-1526510651485-d53183ad67f4?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        {
          quote: 'Priya transformed our vague ideas into a beautiful, functional product. Absolute pleasure to work with.',
          author: 'David Kim',
          role: 'Founder, Nexa Finance',
        },
        {
          quote: 'Outstanding design sensibility and clean code. She delivered ahead of schedule.',
          author: 'Elena Vasquez',
          role: 'Marketing Director',
        },
      ],
    },
    contact: {
      enabled: true,
      email: 'hello@priyadesign.com',
      phone: '(555) 789-0123',
      address: 'Remote - Available Worldwide',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM EST',
      form_enabled: true,
    },
  },
};

export function renderFreelancerTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, projects, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Priya Sharma');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${projects?.enabled ? '<a href="#projects">Work</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Testimonials</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Hire Me</a>
      </nav>
    </div>
  </header>
  `;

  if (hero.enabled) {
    body += `
    <section style="padding: 70px 0; background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%);">
      <div class="container grid grid-2" style="align-items: center;">
        <div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(6,95,70,0.1); color: var(--primary); font-size: 12px; font-weight: 700; margin-bottom: 16px;">
            FREELANCE PRODUCT DESIGNER
          </span>
          <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; color: #0f172a; margin-bottom: 20px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #475569; margin-bottom: 30px; line-height: 1.6;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#contact" class="btn-outline">Hire Me</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div>
                <img src="${escapeHtml(hero.image_url)}" alt="Freelancer Hero" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; object-fit: cover; max-height: 420px;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  if (projects?.enabled && projects.items.length > 0) {
    body += `
    <section id="projects" style="padding: 80px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Selected Work</h2>
          <p style="color: #64748b;">Products designed and built with care.</p>
        </div>
        <div class="grid grid-3">
          ${projects.items
            .map(
              (p) => `
            <div style="background: #ffffff; border: 1px solid #a7f3d0; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              ${
                p.image_url
                  ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />`
                  : ''
              }
              <div style="padding: 24px;">
                <h3 style="font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${escapeHtml(p.title)}</h3>
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 14px;">${escapeHtml(p.description)}</p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
                  ${(p.tags || []).map((tag) => `<span style="font-size: 11px; font-weight: 600; color: #065f46; background: rgba(6,95,70,0.05); padding: 2px 8px; border-radius: 4px;">${escapeHtml(tag)}</span>`).join('')}
                </div>
                ${
                  p.link
                    ? `<a href="${escapeHtml(p.link)}" class="btn-outline" style="padding: 6px 16px; font-size: 12px;">View Project</a>`
                    : ''
                }
              </div>
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
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Client Feedback</h2>
          <p style="color: #64748b;">Happy clients and successful collaborations.</p>
        </div>
        <div class="grid grid-2">
          ${testimonials.items
            .map(
              (t) => `
            <div style="background: #ffffff; border: 1px solid #a7f3d0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div style="color: #34d399; margin-bottom: 14px;">★★★★★</div>
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
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Let's Work Together</h2>
          <p style="color: #64748b; margin-bottom: 30px; font-size: 16px;">
            Have a project in mind? Send me a message and I will get back to you shortly.
          </p>
          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; color: #334155;">
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary);">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>` : ''}
            ${contact.address ? `<div><strong>Location:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Availability:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
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
              <input type="text" name="name" required class="form-control" placeholder="Jordan Smith" />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required class="form-control" placeholder="jordan@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" class="form-control" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Project Details *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="Tell me about your project, timeline, and budget..."></textarea>
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

export const freelancerTemplate: TemplateDefinition = {
  id: 'freelancer',
  name: 'Freelancer Portfolio',
  description: 'Clean portfolio starter for freelance designers, developers, and creatives.',
  thumbnail: 'https://images.unsplash.com/photo-1586718067103-70f43e28a2c1?auto=format&fit=crop&w=600&q=80',
  category: 'freelancer',
  defaultContent: defaultFreelancerContent,
  render: renderFreelancerTemplate,
};
