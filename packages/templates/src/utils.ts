// Render Utilities and Base HTML Shell for LywuAi Published Websites
import type { SiteTheme, SiteSeo, ContactActions, AiChatConfig } from '@lywuai/shared';

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface DocumentOptions {
  theme: SiteTheme;
  seo: SiteSeo;
  contactActions?: ContactActions;
  aiChat?: AiChatConfig;
  hideBadge?: boolean;
  contentHtml: string;
  slug?: string;
  turnstileSiteKey?: string;
}

export function renderDocument(opts: DocumentOptions): string {
  const primary = opts.theme.primary || '#2563eb';
  const accent = opts.theme.accent || '#f59e0b';
  const font = opts.theme.font || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap`;

  const title = escapeHtml(opts.seo.title || 'Welcome to My Website');
  const description = escapeHtml(opts.seo.description || '');

  // Floating WhatsApp or Call Buttons
  let floatingCtaHtml = '';
  if (opts.contactActions?.enable_whatsapp && opts.contactActions.whatsapp_number) {
    const cleanNumber = opts.contactActions.whatsapp_number.replace(/[^0-9]/g, '');
    floatingCtaHtml += `
      <a href="https://wa.me/${cleanNumber}" target="_blank" rel="noopener noreferrer" class="floating-btn whatsapp-btn" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.83.81 2.788.81 3.181 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.796-5.765-5.796zm0 10.375c-.838 0-1.583-.223-2.223-.65l-.159-.106-1.58.414.421-1.54-.104-.165c-.482-.767-.736-1.558-.735-2.662.001-2.479 2.018-4.496 4.498-4.496 2.48 0 4.498 2.017 4.498 4.496-.001 2.479-2.019 4.509-4.617 4.509zm2.463-3.376c-.135-.067-.8-.395-.924-.44-.124-.045-.214-.067-.305.068-.09.135-.35.44-.429.53-.079.09-.158.101-.293.034-.135-.068-.57-.21-1.086-.67-.401-.358-.672-.801-.751-.936-.079-.135-.008-.208.059-.275.061-.06.135-.158.203-.237.068-.079.09-.135.135-.225.045-.09.023-.169-.011-.237-.034-.068-.305-.734-.418-1.006-.11-.264-.222-.228-.305-.232-.079-.004-.169-.005-.26-.005-.09 0-.237.034-.361.169-.124.135-.474.463-.474 1.13 0 .667.485 1.311.553 1.401.068.09 1.01 1.542 2.447 2.162.342.147.609.235.818.301.344.11.657.094.904.057.276-.041.85-.347.97-.682.12-.335.12-.622.084-.682-.036-.06-.126-.095-.261-.162z"/>
        </svg>
      </a>
    `;
  }

  if (opts.contactActions?.enable_call && opts.contactActions.call_number) {
    const cleanNumber = opts.contactActions.call_number.replace(/[^0-9+]/g, '');
    floatingCtaHtml += `
      <a href="tel:${cleanNumber}" class="floating-btn call-btn" title="Call Now" aria-label="Call Now">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </a>
    `;
  }

  // Floating AI Receptionist Chatbot (Paid / Pro feature on published sites)
  let aiChatBoxHtml = '';
  if (opts.aiChat?.enabled) {
    const brandName = escapeHtml(opts.seo.title.split('-')[0].trim() || 'Business');
    const botName = escapeHtml(opts.aiChat.bot_name || `${brandName} AI Assistant`);
    const welcome = escapeHtml(opts.aiChat.welcome_message || `Hello! I'm the 24/7 AI Assistant for ${brandName}. Feel free to ask about our services, pricing, or hours!`);

    floatingCtaHtml += `
      <button id="lywu-chat-toggle" class="floating-btn lywu-chat-btn" title="Chat with 24/7 AI Receptionist" aria-label="Chat with 24/7 AI Receptionist">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="lywu-chat-badge-pulse" aria-hidden="true"></span>
      </button>
    `;

    aiChatBoxHtml = `
      <div id="lywu-chat-box" class="lywu-chat-box" style="display: none;">
        <div class="lywu-chat-header">
          <div class="lywu-chat-header-info">
            <div class="lywu-chat-avatar">🤖</div>
            <div>
              <div class="lywu-chat-title">${botName}</div>
              <div class="lywu-chat-status"><span class="lywu-chat-dot"></span> 24/7 AI Receptionist</div>
            </div>
          </div>
          <button id="lywu-chat-close" class="lywu-chat-close-btn" aria-label="Close Chat">&times;</button>
        </div>
        <div id="lywu-chat-messages" class="lywu-chat-messages">
          <div class="lywu-msg lywu-msg-bot">${welcome}</div>
        </div>
        <form id="lywu-chat-form" class="lywu-chat-input-bar">
          <input id="lywu-chat-input" type="text" placeholder="Ask a question..." autocomplete="off" maxlength="300" />
          <button type="submit" class="lywu-chat-send-btn" aria-label="Send">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;
  }

  // Built with LywuAi Branding Badge (Shown on Free Tier, Removable on Pro Tier)
  const badgeHtml = !opts.hideBadge
    ? `
      <div class="lywu-badge-bar">
        <a href="https://lywuai.workers.dev" target="_blank" rel="noopener noreferrer" class="lywu-badge-pill" title="Launch Your Website Using AI">
          <span class="lywu-badge-icon">⚡</span>
          <span>Built with <strong>LywuAi</strong> — Launch Your Website Using AI</span>
        </a>
      </div>
    `
    : '';

  const turnstileScript = opts.turnstileSiteKey
    ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontUrl}" rel="stylesheet">
  ${turnstileScript}
  <style>
    :root {
      --primary: ${primary};
      --accent: ${accent};
      --font-family: '${font}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-family);
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    img { max-width: 100%; height: auto; display: block; }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; border: none; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 20px; }

    /* Button Styles */
    .btn-primary {
      display: inline-block;
      background-color: var(--primary);
      color: #ffffff !important;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: opacity 0.2s, transform 0.1s;
    }
    .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
    .btn-outline {
      display: inline-block;
      border: 2px solid var(--primary);
      color: var(--primary);
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.2s;
    }
    .btn-outline:hover { background-color: rgba(37,99,235,0.06); }

    /* Floating Quick Actions */
    .floating-cta-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 999;
    }
    .floating-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      transition: transform 0.2s;
      color: white !important;
    }
    .floating-btn:hover { transform: scale(1.08); }
    .whatsapp-btn { background-color: #25D366; }
    .call-btn { background-color: var(--primary); }

    /* Responsive Grid */
    .grid { display: grid; gap: 24px; }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    .grid-4 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

    /* Header Nav */
    header.site-nav {
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #f1f5f9;
      z-index: 100;
      padding: 16px 0;
    }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; }
    .site-brand { font-weight: 800; font-size: 20px; color: #0f172a; }
    .nav-links { display: flex; gap: 20px; align-items: center; }
    .nav-links a { font-size: 14px; font-weight: 500; color: #475569; }
    .nav-links a:hover { color: var(--primary); }

    /* Form Styles */
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #334155; }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
      font-family: inherit;
    }
    .form-control:focus { outline: none; border-color: var(--primary); }

    /* Footer */
    footer.site-footer {
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 36px 0 24px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
    }
    @keyframes credit-pulse {
      0%, 100% { opacity: 0.45; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2); }
      50% { opacity: 1; box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.25); }
    }
    .studio-credit {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 16px;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
      position: relative;
      isolation: isolate;
      overflow: hidden;
      margin-top: 12px;
    }
    .studio-credit:before {
      content: "";
      position: absolute;
      z-index: -1;
      inset: -90% 18%;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(245, 158, 11, 0.18), transparent 70%);
    }
    .studio-credit__pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #f59e0b;
      animation: credit-pulse 1.8s ease-in-out infinite;
    }

    /* AI Chat Widget (Paid Feature) */
    .lywu-chat-btn {
      background: linear-gradient(135deg, var(--primary) 0%, #0f172a 100%) !important;
      position: relative;
    }
    .lywu-chat-badge-pulse {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border: 2px solid #ffffff;
      border-radius: 50%;
      animation: credit-pulse 2s infinite;
    }
    .lywu-chat-box {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 350px;
      max-width: calc(100vw - 36px);
      height: 480px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 12px 36px -4px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 1000;
      animation: lywuFadeUp 0.22s ease-out;
    }
    @keyframes lywuFadeUp {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .lywu-chat-header {
      background: linear-gradient(135deg, var(--primary) 0%, #0f172a 100%);
      color: #ffffff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .lywu-chat-header-info { display: flex; align-items: center; gap: 10px; }
    .lywu-chat-avatar {
      font-size: 18px;
      width: 34px;
      height: 34px;
      background: rgba(255,255,255,0.18);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lywu-chat-title { font-weight: 700; font-size: 13px; line-height: 1.2; }
    .lywu-chat-status { font-size: 10px; opacity: 0.85; display: flex; align-items: center; gap: 4px; }
    .lywu-chat-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block; }
    .lywu-chat-close-btn { background: none; color: #ffffff; font-size: 22px; line-height: 1; opacity: 0.8; padding: 2px 6px; }
    .lywu-chat-close-btn:hover { opacity: 1; }
    .lywu-chat-messages {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }
    .lywu-msg {
      max-width: 84%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 12.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .lywu-msg-bot {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .lywu-msg-user {
      align-self: flex-end;
      background: var(--primary);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .lywu-typing { font-style: italic; color: #64748b; background: #f1f5f9; }
    .lywu-chat-input-bar {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      gap: 8px;
    }
    .lywu-chat-input-bar input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 12px;
      font-family: inherit;
      outline: none;
    }
    .lywu-chat-input-bar input:focus { border-color: var(--primary); }
    .lywu-chat-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.1s;
    }
    .lywu-chat-send-btn:hover { transform: scale(1.05); }
    .lywu-badge-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 14px 20px 20px;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .lywu-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      text-decoration: none;
      padding: 5px 14px;
      border-radius: 9999px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: all 0.2s ease;
    }
    .lywu-badge-pill:hover {
      color: #2563eb;
      border-color: #93c5fd;
      background: #eff6ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37,99,235,0.12);
    }
    .lywu-badge-icon {
      font-size: 12px;
      filter: drop-shadow(0 1px 2px rgba(245,158,11,0.4));
    }
  </style>
</head>
<body>
  ${opts.contentHtml}
  ${badgeHtml}

  ${aiChatBoxHtml}
  ${floatingCtaHtml ? `<div class="floating-cta-container">${floatingCtaHtml}</div>` : ''}

  <script>
    // Floating AI Receptionist Widget Logic
    (function() {
      var toggleBtn = document.getElementById('lywu-chat-toggle');
      var closeBtn = document.getElementById('lywu-chat-close');
      var box = document.getElementById('lywu-chat-box');
      var form = document.getElementById('lywu-chat-form');
      var input = document.getElementById('lywu-chat-input');
      var msgBox = document.getElementById('lywu-chat-messages');
      if (!toggleBtn || !box || !form || !input || !msgBox) return;

      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var hidden = box.style.display === 'none' || !box.style.display;
        box.style.display = hidden ? 'flex' : 'none';
        if (hidden) input.focus();
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          box.style.display = 'none';
        });
      }

      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) return;
        input.value = '';

        var u = document.createElement('div');
        u.className = 'lywu-msg lywu-msg-user';
        u.innerText = q;
        msgBox.appendChild(u);

        var b = document.createElement('div');
        b.className = 'lywu-msg lywu-msg-bot lywu-typing';
        b.innerText = 'Typing...';
        msgBox.appendChild(b);
        msgBox.scrollTop = msgBox.scrollHeight;

        try {
          var res = await fetch('/api/public/chat/' + encodeURIComponent('${escapeHtml(opts.slug || '')}'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q })
          });
          var data = await res.json();
          b.innerText = data.reply || "Thanks for your question! Feel free to call us or chat on WhatsApp for details.";
          b.classList.remove('lywu-typing');
        } catch (err) {
          b.innerText = "We're here to help! Please call or message us on WhatsApp directly.";
          b.classList.remove('lywu-typing');
        }
        msgBox.scrollTop = msgBox.scrollHeight;
      });
    })();

    async function submitContactForm(e, siteSlug) {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button[type="submit"]');
      const msgBox = form.querySelector('.form-feedback');
      
      const originalText = btn.innerText;
      btn.innerText = 'Sending...';
      btn.disabled = true;
      msgBox.style.display = 'none';

      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        turnstileToken: formData.get('cf-turnstile-response') || ''
      };

      try {
        const res = await fetch('/api/sites/' + (siteSlug || '${escapeHtml(opts.slug || '')}') + '/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const resData = await res.json();
        if (res.ok) {
          msgBox.innerText = 'Thank you! Your message has been sent successfully.';
          msgBox.style.color = '#15803d';
          msgBox.style.display = 'block';
          form.reset();
        } else {
          msgBox.innerText = resData.error || 'Failed to submit form. Please try again.';
          msgBox.style.color = '#b91c1c';
          msgBox.style.display = 'block';
        }
      } catch (err) {
        msgBox.innerText = 'Network error. Please try again later.';
        msgBox.style.color = '#b91c1c';
        msgBox.style.display = 'block';
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;
}
