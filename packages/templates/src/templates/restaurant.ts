import type { SiteContent, TemplateDefinition } from '@lywuai/shared';
import { escapeHtml, renderDocument } from '../utils';

export const defaultRestaurantContent: SiteContent = {
  template_id: 'restaurant',
  theme: {
    primary: '#ea580c',
    accent: '#d97706',
    font: 'Outfit',
    logo_url: null,
  },
  seo: {
    title: 'Bella Vista Bistro - Authentic Wood-Fired Italian Kitchen',
    description: 'Fresh homemade pasta, artisan wood-fired pizzas, and classic Mediterranean flavors. Dine-in or reserve a table today.',
  },
  contact_actions: {
    enable_whatsapp: true,
    whatsapp_number: '+15554321098',
    enable_call: true,
    call_number: '+15554321098',
  },
  sections: {
    hero: {
      enabled: true,
      headline: 'Authentic Artisan Cuisine, Crafted with Passion',
      subhead: 'From our wood-burning stone oven to your table: farm-fresh ingredients, handmade pasta, and handcrafted cocktails.',
      cta_label: 'Reserve a Table',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    },
    menu: {
      enabled: true,
      categories: [
        {
          category: 'Starters & Antipasti',
          items: [
            { name: 'Bruschetta al Pomodoro', description: 'Toasted rustic bread, heirloom tomatoes, fresh garlic, basil, EVOO', price: '$12' },
            { name: 'Burrata Pugliese', description: 'Creamy burrata, prosciutto di Parma, wild arugula, balsamic reduction', price: '$16' },
            { name: 'Calamari Fritti', description: 'Crispy lightly battered calamari served with spicy house marinara', price: '$15' },
          ],
        },
        {
          category: 'Artisan Wood-Fired Pizza',
          items: [
            { name: 'Margherita D.O.P.', description: 'San Marzano tomato, fresh mozzarella fior di latte, fresh basil, EVOO', price: '$18' },
            { name: 'Tartufo & Funghi', description: 'Wild forest mushrooms, truffle cream sauce, mozzarella, thyme', price: '$22' },
            { name: 'Diavola Piccante', description: 'Spicy soppressata calabrese, San Marzano sauce, crushed red pepper', price: '$20' },
          ],
        },
        {
          category: 'Homemade Pasta & Mains',
          items: [
            { name: 'Tagliatelle al Ragù Bolognese', description: 'Slow-braised beef & veal ragù, aged Parmigiano Reggiano 24 months', price: '$24' },
            { name: 'Ravioli Ricotta & Spinaci', description: 'Handmade ravioli, browned sage butter sauce, toasted pine nuts', price: '$22' },
            { name: 'Branzino alla Griglia', description: 'Pan-seared Mediterranean sea bass, roasted fennel, lemon caper glaze', price: '$31' },
          ],
        },
      ],
    },
    testimonials: {
      enabled: true,
      items: [
        { quote: 'Hands down the most authentic Margherita pizza outside of Naples. The ambience is truly magical.', author: 'David Chen', role: 'Food Critic' },
        { quote: 'Our favorite anniversary spot every year. Impeccable service and an extraordinary wine selection.', author: 'Elena Rossi', role: 'Regular Guest' },
      ],
    },
    contact: {
      enabled: true,
      email: 'reservations@bellavistabistro.com',
      phone: '(555) 432-1098',
      address: '142 Grand Avenue, Downtown Metro',
      hours: 'Tue - Sun: 5:00 PM - 11:00 PM (Closed Mondays)',
      form_enabled: true,
    },
  },
};

export function renderRestaurantTemplate(content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }): string {
  const { hero, menu, testimonials, contact } = content.sections;
  const brandName = escapeHtml(content.seo.title.split('-')[0].trim() || 'Bella Vista');

  let body = `
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="site-brand">${brandName}</div>
      <nav class="nav-links">
        ${menu?.enabled ? '<a href="#menu">Our Menu</a>' : ''}
        ${testimonials?.enabled ? '<a href="#reviews">Reviews</a>' : ''}
        <a href="#contact" class="btn-primary" style="padding: 8px 18px; font-size: 13px;">Reserve Table</a>
      </nav>
    </div>
  </header>
  `;

  // Hero
  if (hero.enabled) {
    body += `
    <section style="position: relative; padding: 120px 0; background: linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.7)), url('${escapeHtml(hero.image_url || '')}') center/cover no-repeat; color: white; text-align: center;">
      <div class="container" style="max-width: 800px;">
        <span style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background: rgba(234,88,12,0.85); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;">
          FINE CASUAL DINING
        </span>
        <h1 style="font-size: 48px; font-weight: 800; line-height: 1.15; margin-bottom: 20px;">
          ${escapeHtml(hero.headline)}
        </h1>
        <p style="font-size: 18px; color: #cbd5e1; margin-bottom: 30px; line-height: 1.6;">
          ${escapeHtml(hero.subhead)}
        </p>
        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          <a href="${escapeHtml(hero.cta_url)}" class="btn-primary">${escapeHtml(hero.cta_label)}</a>
          <a href="#menu" class="btn-outline" style="border-color: #ffffff; color: #ffffff;">Explore Menu</a>
        </div>
      </div>
    </section>
    `;
  }

  // Menu Section
  if (menu?.enabled && menu.categories.length > 0) {
    body += `
    <section id="menu" style="padding: 90px 0; background: #fffaf5;">
      <div class="container">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 50px;">
          <span style="color: var(--primary); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Chef's Selections</span>
          <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-top: 6px;">Our Seasonal Menu</h2>
          <p style="color: #64748b;">Prepared fresh daily using locally-sourced organic ingredients.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 48px;">
          ${menu.categories
            .map(
              (cat) => `
            <div>
              <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #fed7aa; padding-bottom: 8px; margin-bottom: 24px;">
                ${escapeHtml(cat.category)}
              </h3>
              <div class="grid grid-2" style="gap: 20px;">
                ${cat.items
                  .map(
                    (item) => `
                  <div style="background: #ffffff; border: 1px solid #ffedd5; border-radius: 12px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                      <h4 style="font-size: 16px; font-weight: 700; color: #0f172a;">${escapeHtml(item.name)}</h4>
                      <span style="font-weight: 800; color: var(--primary); font-size: 16px;">${escapeHtml(item.price)}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">${escapeHtml(item.description)}</p>
                  </div>
                `
                  )
                  .join('')}
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

  // Reservation & Location
  if (contact.enabled) {
    const turnstileWidget = options?.turnstileSiteKey
      ? `<div class="cf-turnstile" data-sitekey="${options.turnstileSiteKey}" style="margin-bottom: 16px;"></div>`
      : '';

    body += `
    <section id="contact" style="padding: 90px 0;">
      <div class="container grid grid-2" style="align-items: center; gap: 50px;">
        <div>
          <span style="color: var(--primary); font-weight: 700; font-size: 13px; text-transform: uppercase;">Location & Hours</span>
          <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-top: 6px; margin-bottom: 20px;">Visit Our Bistro</h2>
          <div style="font-size: 15px; color: #475569; display: flex; flex-direction: column; gap: 14px; margin-bottom: 30px;">
            ${contact.address ? `<div><strong>Address:</strong> ${escapeHtml(contact.address)}</div>` : ''}
            ${contact.hours ? `<div><strong>Dining Hours:</strong> ${escapeHtml(contact.hours)}</div>` : ''}
            ${contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${escapeHtml(contact.phone)}" style="color: var(--primary); font-weight: 600;">${escapeHtml(contact.phone)}</a></div>` : ''}
            ${contact.email ? `<div><strong>Email:</strong> ${escapeHtml(contact.email)}</div>` : ''}
          </div>
        </div>

        ${
          contact.form_enabled
            ? `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
          <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">Table Reservation / Inquiry</h3>
          <form onsubmit="submitContactForm(event, '${escapeHtml(options?.slug || '')}')">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" required class="form-control" placeholder="Jane Smith" />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required class="form-control" placeholder="jane@example.com" />
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="phone" required class="form-control" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Party Size & Preferred Date/Time *</label>
              <textarea name="message" required rows="3" class="form-control" placeholder="e.g. Table for 4 on Friday at 7:30 PM"></textarea>
            </div>
            ${turnstileWidget}
            <div class="form-feedback" style="display: none; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>
            <button type="submit" class="btn-primary" style="width: 100%;">Request Reservation</button>
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
      <div>© ${new Date().getFullYear()} ${brandName}. Handcrafted Hospitality.</div>
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

export const restaurantTemplate: TemplateDefinition = {
  id: 'restaurant',
  name: 'Restaurant & Café',
  description: 'Gastronomy and hospitality starter with categorized menu, dining hours, and table reservation booking.',
  thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  category: 'restaurant',
  defaultContent: defaultRestaurantContent,
  render: renderRestaurantTemplate,
};
