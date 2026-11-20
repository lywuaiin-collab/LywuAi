# LywuAi — Free-Tier AI Website Builder
*(Live Your Website Using Ai)*

A hosted, template-based, zero-cost, no-code website builder running entirely on Cloudflare's edge infrastructure with **no credit card required anywhere**.

---

## ⚡ Verified Free-Tier Architecture (Zero-Card Constraints)

| Resource | Free Tier Limit | Architecture Decision in LywuAi |
| :--- | :--- | :--- |
| **Cloudflare Workers** | 100k req/day, 10ms CPU/req | Render-at-publish snapshots; lightweight server-side renderer. |
| **Workers Static Assets** | Unlimited requests, 20k files, 25 MiB/file | Host the full React + Vite + Tailwind SPA with zero bandwidth fees. |
| **Cloudflare D1 (Content)** | 5M reads/day, 100k writes/day, 500 MB/DB | Store users, site drafts, published HTML snapshots, and contact leads. |
| **Cloudflare D1 (Media)** | 500 MB/DB | Store client-compressed WebP image blobs (≤200 KB each). |
| **Unsplash Stock Photos** | Unlimited free stock image CDN | High-speed stock photos embedded via direct URL (**0 D1 storage used**). |
| **Cloudflare Turnstile** | Free, unlimited challenges, 20 widgets | Spam protection for public contact forms without annoying captchas. |
| **LywuAi Copilot** (OpenRouter backend) | Free open-source models (`:free`) | `meta-llama/llama-3.2-3b-instruct:free` or instant smart copy presets. |
| **R2 & CF Images** | Requires Credit Card on file | **Strictly excluded** to guarantee 100% free operation without a card. |

---

## 📁 Monorepo Layout

```text
LywuAi (Live Your Website Using Ai)/
├── wrangler.jsonc            # Cloudflare Worker config with Assets & D1 bindings
├── package.json              # Monorepo workspaces configuration
├── migrations/
│   ├── 0001_content.sql      # Users, sites, submissions, rate limits, AI logs
│   └── 0002_media.sql        # Media blobs table
├── packages/
│   ├── shared/               # TypeScript interfaces & Zod validation schemas
│   └── templates/            # 4 Curated templates + self-contained HTML renderer
└── apps/
    ├── web/                  # React + Vite + Tailwind Visual Website Builder SPA
    └── worker/               # Hono backend API, D1 snapshot server & contact handler
```

---

## 🎨 4 Curated High-Converting Templates

1. **Local Business & Services**: Hero with CTA, trust badges, features grid, customer reviews, contact form, and floating WhatsApp / Click-to-Call buttons.
2. **Creative & Personal Portfolio**: Minimalist showcase with bio, project grid, tags, case study links, and inquiry form.
3. **Restaurant & Café**: Wood-fired dining hero, seasonal menu categories with item prices, dining hours, and reservation booking.
4. **Modern Agency & Startup**: Digital innovation hero, capabilities list, 3-tier pricing tables, and consultation inquiry.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```powershell
cd "E:\Websites\LywuAi (Live Your Website Using Ai)"
npm install
```

### 2. Initialize Local D1 Databases
```powershell
npm run db:migrate:local
```

### 3. Build Web SPA
```powershell
npm run build:web
```

### 4. Start Local Dev Server
```powershell
npm run dev
```

Open **`http://localhost:8787`** in your browser!

* Sign in with any email & password (or GitHub if configured).
* Click **"Create Website"** and select a template.
* Enter a business description and watch AI craft your copy.
* Edit colors, headline, CTA, and toggle WhatsApp floating buttons.
* Click **"Publish Live"** to serve your website at `/s/<slug>`!

---

## 🌐 Deploy to Cloudflare Edge

```powershell
# 1. Create remote D1 databases
npx wrangler d1 create lywuai
npx wrangler d1 create lywuai_media

# 2. Update database_id values in wrangler.jsonc with outputs from step 1

# 3. Apply remote migrations
npm run db:migrate:remote

# 4. Deploy SPA and Worker
npm run deploy
```
