import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultTutorContent: SiteContent = {
  template_id: 'tutor',
  theme: {
    primary: '#5b21b6',
    accent: '#a78bfa',
    font: 'Inter',
    logo_url: null,
  },
  seo: {
    title: 'BrightMind Academy - Expert Tutoring & Test Prep',
    description: 'Personalized one-on-one tutoring for K-12, college, and standardized test preparation. Boost your grades and confidence.',
  },
  contact_actions: {
    enable_whatsapp: true,
    whatsapp_number: '+15556789012',
    enable_call: true,
    call_number: '+15556789012',
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Unlock Your Academic Potential',
      subhead: 'Expert tutoring and test prep for students of all ages. Personalized 1-on-1 sessions that build confidence and improve grades.',
      cta_label: 'Book Free Session',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
    },
    features: {
      enabled: true,
      items: [
        {
          title: 'Subject Tutoring',
          text: 'Math, science, English, history, and more — expert tutors for every grade level.',
        },
        {
          title: 'Test Preparation',
          text: 'SAT, ACT, GRE, and other standardized test prep with proven score-improvement strategies.',
        },
        {
          title: 'Flexible Scheduling',
          text: 'After-school, evening, and weekend sessions available online or in person.',
        },
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        {
          quote: 'My daughter went from a C to an A in math after just one semester with BrightMind.',
          author: 'Sarah Thompson',
          role: 'Parent',
        },
        {
          quote: 'The SAT prep helped me improve my score by 200 points. I got into my top-choice college!',
          author: 'Marcus Bell',
          role: 'Student',
        },
      ],
    },
    contact: {
      enabled: true,
      email: 'hello@brightmindacademy.com',
      phone: '(555) 678-9012',
      address: '700 Scholar Street, Suite 300, Education District',
      hours: 'Mon - Fri: 3:00 PM - 9:00 PM | Sat: 9:00 AM - 4:00 PM',
      form_enabled: true,
    },
  },
};

export function renderTutorTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, features, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'BrightMind Academy');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${features?.enabled ? '<a href="#subjects">Subjects</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Results</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Enroll Now</a>
      </nav>
    </div>
  </header>
  `;

  if (hero.enabled) {
    body += `
    <section style="padding: 70px 0; background: linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%);">
      <div class="container grid grid-2" style="align-items: center;">
        <div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(91,33,182,0.1); color: var(--primary); font-size: 12px; font-weight: 700; margin-bottom: 16px;">
            K-12 • COLLEGE • TEST PREP
          </span>
          <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; color: #0f172a; margin-bottom: 20px;">
            ${escapeHtml(hero.headline)}
          </h1>
          <p style="font-size: 18px; color: #475569; margin-bottom: 30px; line-height: 1.6;">
            ${escapeHtml(hero.subhead)}
          </p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
            <a href="#contact" class="btn-outline">Learn More</a>
          </div>
        </div>
        ${
          hero.image_url
            ? `<div>
                <img src="${escapeHtml(hero.image_url)}" alt="Tutoring Hero" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; object-fit: cover; max-height: 420px;" />
              </div>`
            : ''
        }
      </div>
    </section>
    `;
  }

  if (features?.enabled && features.items.length > 0) {
    body += `
    <section id="subjects" style="padding: 80px 0;">
      <div class="container">
        <div style="text-align: center; max-width: 650px; margin: 0 auto 50px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Expert Subject Tutoring</h2>
          <p style="color: #64748b;">Personalized instruction that builds skills and confidence.</p>
        </div>
        <div class="grid grid-3">
          ${features.items
            .map(
              (f) => `
            <div style="background: #ffffff; border: 1px solid #ddd6fe; border-radius: 14px; padding: 32px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(91,33,182,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 20px;">📚</div>
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
          <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Student Success Stories</h2>
          <p style="color: #64748b;">Real grade improvements and college acceptances.</p>
        </div>
        <div class="grid grid-2">
          ${testimonials.items
            .map(
              (t) => `
            <div style="background: #ffffff; border: 1px solid #ddd6fe; border-radius: 16px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div style="color: #a78bfa; margin-bottom: 14px;">★★★★★</div>
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
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Get Started</h2>
          <p style="color: #64748b; margin-bottom: 30px; font-size: 16px;">
            Ready to boost grades? Send us a message or schedule a free assessment.
          </p>
          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; color: #334155;">
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary);">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}" style="color: var(--primary);">${escapeHtml(contact.email)}</a></div>` : ''}
            ${contact.address ? `<div><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Center Hours:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
          </div>
        </div>
        ${
          contact.form_enabled
            ? `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 20px;">Request Information</h3>
          <form onsubmit="submitContactForm(event, '${escapeHtml(options?.slug || '')}')">
            <div class="form-group">
              <label>Parent or Student Name *</label>
              <input type="text" name="name" required class="form-control" placeholder="Alex Rivera" />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required class="form-control" placeholder="alex@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" class="form-control" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Grade Level & Subject *</label>
              <textarea name="message" required rows="4" class="form-control" placeholder="e.g. 10th grade Algebra, SAT prep"></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Book Free Assessment</button>
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

export const tutorTemplate: TemplateDefinition = {
  id: 'tutor',
  name: 'Tutoring & Test Prep',
  description: 'Academic starter for tutors, learning centers, and test prep services.',
  thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
  category: 'tutor',
  defaultContent: defaultTutorContent,
  render: renderTutorTemplate,
};
