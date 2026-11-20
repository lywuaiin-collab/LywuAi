import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultPortfolioContent: SiteContent = {
  template_id: 'portfolio',
  theme: {
    primary: '#0ea5e9',
    accent: '#6366f1',
    font: 'Plus Jakarta Sans',
    logo_url: null,
  },
  seo: {
    title: 'Alex Rivers - Senior UI/UX Designer & Full-Stack Creative',
    description: 'Crafting thoughtful digital interfaces, design systems, and fast web products for modern brands worldwide.',
  },
  contact_actions: {
    enable_whatsapp: false,
    enable_call: false,
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Designing thoughtful digital experiences that scale.',
      subhead: 'I help tech companies and modern startups turn complex ideas into intuitive, high-impact digital products.',
      cta_label: 'View Featured Work',
      cta_url: '#projects',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    projects: {
      enabled: true,
      items: [
        {
          title: 'Fintech Mobile Banking App',
          description: 'A frictionless banking application with real-time biometric authorization and AI budget analytics.',
          tags: ['Mobile UI', 'Fintech', 'React Native'],
          link: '#',
          image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'SaaS Design System Architecture',
          description: 'Unified 120+ modular enterprise UI components with WCAG AAA accessibility across 4 products.',
          tags: ['Design System', 'Figma', 'Tokens'],
          link: '#',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'EcoCommerce Sustainability Platform',
          description: 'Headless e-commerce storefront with carbon footprint tracker and zero-waste customer incentives.',
          tags: ['Next.js', 'Tailwind', 'E-commerce'],
          link: '#',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    features: {
      enabled: true,
      items: [
        { title: 'Product Strategy', text: 'Aligning business metrics with user research and technical constraints.' },
        { title: 'Interface & Motion Design', text: 'Clean, modern typography and micro-interactions that delight users.' },
        { title: 'Front-End Development', text: 'Bridging design into clean, edge-native performant code.' },
      ],
    },
    contact: {
      enabled: true,
      email: 'alex@riversdesign.dev',
      phone: '+1 (555) 987-6543',
      address: 'San Francisco, CA (Available Worldwide)',
      form_enabled: true,
    },
  },
};

export function renderPortfolioTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, projects, features, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Alex Rivers');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${projects?.enabled ? '<a href="#projects">Work</a>' : ''}
        ${features?.enabled ? '<a href="#skills">Capabilities</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Let\'s Talk</a>
      </nav>
    </div>
  </header>
  `;

  // Hero Section
  if (hero.enabled) {
    body += `
    <section style="padding: 90px 0 60px;">
      <div class="container grid grid-2" style="align-items: center; gap: 40px;">
        <div>
          <span style="font-size: 13px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 12px;">
            PORTFOLIO / DIGITAL CREATOR
          </span>
          <h1 style="font-size: 44px; font-weight: 800; line-height: 1.15; color: #0f172a; margin-bottom: 20px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #64748b; line-height: 1.6; margin-bottom: 30px;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#contact" class="btn-outline">Contact Me</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div style="text-align: center;">
                <img src="${escapeHtml(hero.image_url)}" alt="Creator Headshot" style="width: 320px; height: 320px; border-radius: 50%; object-fit: cover; margin: 0 auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 6px solid #ffffff;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  // Projects Grid
  if (projects?.enabled && projects.items.length > 0) {
    body += `
    <section id="projects" style="padding: 80px 0; background: #f8fafc;">
      <div class="container">
        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Selected Projects</h2>
          <p style="color: #64748b;">A curated showcase of recent client collaborations and digital products.</p>
        </div>
        <div class="grid grid-3">
          ${projects.items
            .map(
              (p) => `
            <div style="background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; display: flex; flex-direction: column;">
              ${
                p.image_url
                  ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 200px; object-fit: cover;" />`
                  : ''
              }
              <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
                ${
                  p.tags && p.tags.length > 0
                    ? `<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                        ${p.tags.map((t) => `<span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0369a1;">${escapeHtml(t)}</span>`).join('')}
                       </div>`
                    : ''
                }
                <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${escapeHtml(p.title)}</h3>
                <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 16px; flex: 1;">${escapeHtml(p.description)}</p>
                ${p.link ? `<a href="${escapeHtml(p.link)}" style="font-size: 13px; font-weight: 700; color: var(--primary);">View Case Study →</a>` : ''}
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

  // Skills / Capabilities
  if (features?.enabled && features.items.length > 0) {
    body += `
    <section id="skills" style="padding: 80px 0;">
      <div class="container">
        <h2 style="font-size: 30px; font-weight: 800; color: #0f172a; margin-bottom: 40px; text-align: center;">Core Capabilities</h2>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="border-left: 3px solid var(--primary); padding-left: 20px;">
              <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${escapeHtml(f.title)}</h3>
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

  // Contact
  if (contact.enabled) {
    const turnstileWidget = options?.turnstileSiteKey
      ? `<div class="cf-turnstile" data-sitekey="${options.turnstileSiteKey}" style="margin-bottom: 16px;"></div>`
      : '';

    body += `
    <section id="contact" style="padding: 80px 0; background: #0f172a; color: #ffffff;">
      <div class="container grid grid-2" style="align-items: center; gap: 50px;">
        <div>
          <h2 style="font-size: 36px; font-weight: 800; margin-bottom: 16px;">Have a project in mind?</h2>
          <p style="color: #94a3b8; font-size: 16px; margin-bottom: 30px;">
            Let's discuss how we can bring your vision to life with precision and creativity.
          </p>
          <div style="font-size: 14px; color: #cbd5e1; display: flex; flex-direction: column; gap: 10px;">
            <div>Email: <a href="mailto:${escapeHtml(contact.email)}" style="color: #38bdf8;">${escapeHtml(contact.email)}</a></div>
            ${contact.phone ? `<div>Phone: ${escapeHtml(contact.phone)}</div>` : ''}
            ${contact.address ? `<div>Location: ${escapeHtml(contact.address)}</div>` : ''}
          </div>
        </div>

        ${
          contact.form_enabled
            ? `
        <div style="background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
          <form onsubmit="submitContactForm(event, '${escapeHtml(options?.slug || '')}')">
            <div class="form-group">
              <label style="color: #cbd5e1;">Your Name *</label>
              <input type="text" name="name" required class="form-control" style="background: #0f172a; border-color: #475569; color: #ffffff;" />
            </div>
            <div class="form-group">
              <label style="color: #cbd5e1;">Email Address *</label>
              <input type="email" name="email" required class="form-control" style="background: #0f172a; border-color: #475569; color: #ffffff;" />
            </div>
            <div class="form-group">
              <label style="color: #cbd5e1;">Project Details *</label>
              <textarea name="message" required rows="4" class="form-control" style="background: #0f172a; border-color: #475569; color: #ffffff;"></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Send Message</button>
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

export const portfolioTemplate: TemplateDefinition = {
  id: 'portfolio',
  name: 'Creative Portfolio',
  description: 'Minimalist, visual-first portfolio for designers, creators, consultants, and engineers.',
  thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  category: 'portfolio',
  defaultContent: defaultPortfolioContent,
  render: renderPortfolioTemplate,
};
