-- Migration: 0006 — Copilot Enhancements (Chat History + Knowledge Base)
-- Keeps all AI logic server-side; no secrets exposed to client.

-- Copilot Chat History — memory per site/session so Copilot remembers context
CREATE TABLE IF NOT EXISTS copilot_chat_history (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_copilot_chat_site ON copilot_chat_history(site_id);
CREATE INDEX IF NOT EXISTS idx_copilot_chat_session ON copilot_chat_history(session_id);

-- Copilot Knowledge Base — FAQ/help articles for server-side RAG
CREATE TABLE IF NOT EXISTS copilot_knowledge_base (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  keywords TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed knowledge base with LywuAi help articles
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-001', 'Connect Custom Domain', 'To connect your custom domain: 1) Go to the Domain tab in the editor. 2) Enter your domain (e.g. www.yourbusiness.com). 3) Add a CNAME record in your DNS provider pointing to our edge gateway. 4) Click Save Domain. Your site will be live with free SSL in 5-30 minutes.', 'domain', 'domain,cname,dns,custom domain,url,website address');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-002', 'Enable WhatsApp Button', 'To add a floating WhatsApp button: 1) Open the CTA (WhatsApp & Call) tab in the editor sidebar. 2) Turn on Floating WhatsApp Button. 3) Enter your phone number with country code (e.g. +91 98765 43210). 4) Optionally add a pre-filled message. 5) Save.', 'cta', 'whatsapp,phone,call,cta,contact button,floating button');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-003', 'Enable AI Receptionist', 'To activate your 24/7 AI Receptionist: 1) In the visual editor sidebar, select the AI Bot tab. 2) Toggle on 24/7 AI Receptionist. 3) Set a custom Bot Name. 4) Set a welcome greeting message. Your visitors can now chat with your AI assistant 24/7.', 'ai-bot', 'receptionist,ai bot,chatbot,bot,visitor chat,ai receptionist');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-004', 'Publish Website', 'To publish your site: 1) Click the blue Publish button in the top right header of the visual editor. 2) Your site compiles and deploys across global edge infrastructure with automatic free SSL. 3) Click View Live Site or share your URL.', 'publishing', 'publish,live,launch,deploy,go live');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-005', 'Pricing - 100% Free', 'LywuAi is 100% free forever. No credit card, no subscription, no hidden fees. Every account gets live publishing, custom domain, AI Receptionist, WhatsApp buttons, all 10 templates, and AI copywriting for free.', 'pricing', 'free,price,pricing,cost,plan,subscription,fee');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-006', 'SEO Setup', 'To improve Google ranking: 1) Open the SEO tab in the editor. 2) Set Meta Title (e.g. Business Name — Service in City). 3) Write Meta Description (1-2 sentences about what you do). 4) These tags help Google index your site and create rich preview cards for WhatsApp sharing.', 'seo', 'seo,google,search,meta,rank,visibility');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-007', 'Theme Customization', 'To customize your brand: 1) Go to the Theme tab in the editor sidebar. 2) Choose Primary and Accent colors. 3) Select typography for headings and body. 4) Upload your logo. Changes update instantly in the preview.', 'theme', 'theme,color,font,logo,brand,typography');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-008', 'Support Tickets', 'To raise a support ticket: 1) Click the Ticket / Feedback button in the Copilot chat. 2) Select Problem or Feature Suggestion. 3) Type your details and submit. Our team reviews all tickets immediately.', 'support', 'ticket,bug,problem,suggestion,feedback,support,issue');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-009', 'Hero Headlines', 'To write great headlines: 1) Go to the Hero tab in the editor. 2) Write a clear Main Headline stating your value proposition. 3) Add a Subheadline with supporting details. 4) Set a CTA button text and link. Keep it short and action-oriented.', 'copywriting', 'headline,copy,slogan,tagline,hero,writing');
INSERT OR IGNORE INTO copilot_knowledge_base (id, title, content, category, keywords) VALUES
('kb-010', 'Site Sections', 'To manage page sections: 1) Open the Sections tab in the visual editor. 2) Toggle sections on/off (Features, Menu, Projects, Testimonials, Gallery, Contact). 3) Expand each to edit titles, descriptions, images, prices. Add or remove items with 1 click.', 'sections', 'section,feature,menu,gallery,testimonial,service,page');