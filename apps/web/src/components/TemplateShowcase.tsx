import React, { useState } from 'react';
import { templates } from '@lywuai/templates';
import type { TemplateDefinition } from '@lywuai/shared';
import { X, Eye, ArrowRight, Zap } from 'lucide-react';

// Demo preview HTML for each template (lightweight inline snapshots — zero server call needed)
const DEMO_PREVIEWS: Record<string, string> = {
  business: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Apex Electricians – Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#fff}nav{background:#1e3a5f;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#fff;font-weight:800;font-size:1.2rem}nav .cta{background:#f59e0b;color:#1e3a5f;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:#fff;padding:5rem 2rem;text-align:center}.hero h1{font-size:2.6rem;font-weight:800;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#f59e0b;color:#1e3a5f;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.4)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto}.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:.5rem}.section .sub{text-align:center;color:#64748b;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:1rem;padding:1.5rem}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem}.card p{font-size:.82rem;color:#64748b;line-height:1.6}footer{background:#0f172a;color:#94a3b8;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">⚡ Apex Electricians</span><a href="#" class="cta">Get a Free Quote</a></nav><div class="hero"><h1>Trusted Local Electrician<br/>Fast, Safe &amp; Affordable</h1><p>Certified residential &amp; commercial electrical services. Available 24/7 for emergencies across North London.</p><a href="#" class="btn">📞 Call Now</a><a href="#" class="btn outline">💬 WhatsApp Us</a></div><div class="section"><h2>Our Services</h2><p class="sub">Professional solutions for every electrical need</p><div class="cards"><div class="card"><div class="icon">🏠</div><h3>Home Rewiring</h3><p>Complete rewiring services keeping your family safe with modern standards.</p></div><div class="card"><div class="icon">⚡</div><h3>Emergency Repairs</h3><p>24/7 rapid response for power outages, fuse failures and urgent faults.</p></div><div class="card"><div class="icon">💡</div><h3>Smart Lighting</h3><p>Energy-efficient LED upgrades and smart home automation setups.</p></div><div class="card"><div class="icon">🛡️</div><h3>Safety Inspections</h3><p>EICR Electrical Installation Condition Reports for landlords and buyers.</p></div></div></div><footer>© 2025 Apex Electricians · Designed by GrowthMachine Studio</footer></body></html>`,

  portfolio: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Alex Rivera – Portfolio Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#0f172a}nav{padding:1.25rem 2rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}nav .logo{color:#fff;font-weight:800;font-size:1.1rem}nav .links{display:flex;gap:1.5rem}nav .links a{color:rgba(255,255,255,.65);text-decoration:none;font-size:.85rem;font-weight:600}.hero{padding:6rem 2rem;text-align:center;background:linear-gradient(to bottom right,#0f172a,#1e1b4b)}.tag{display:inline-block;background:rgba(139,92,246,.2);color:#a78bfa;padding:.3rem 1rem;border-radius:9999px;font-size:.75rem;font-weight:700;margin-bottom:1.25rem}.hero h1{font-size:3rem;font-weight:800;color:#fff;line-height:1.1;margin-bottom:1rem}.hero h1 span{color:#818cf8}.hero p{color:#94a3b8;font-size:1rem;max-width:500px;margin:0 auto 2rem}.btn{display:inline-flex;align-items:center;gap:.5rem;background:#6366f1;color:#fff;padding:.85rem 1.75rem;border-radius:9999px;font-weight:700;font-size:.88rem;text-decoration:none;margin:.3rem}.btn.ghost{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.12)}.work{padding:4rem 2rem;max-width:960px;margin:0 auto}.work h2{font-size:1.6rem;font-weight:800;color:#fff;margin-bottom:1.75rem;text-align:center}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}.item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:1rem;overflow:hidden}.thumb{height:120px;display:flex;align-items:center;justify-content:center;font-size:3rem}.info{padding:1rem}.info h3{color:#e2e8f0;font-size:.9rem;font-weight:700;margin-bottom:.3rem}.info p{color:#64748b;font-size:.78rem}footer{text-align:center;padding:1.5rem;color:#334155;font-size:.8rem;border-top:1px solid rgba(255,255,255,.06)}</style></head><body><nav><span class="logo">✦ Alex Rivera</span><div class="links"><a href="#">Work</a><a href="#">About</a><a href="#">Contact</a></div></nav><div class="hero"><div class="tag">Available for freelance</div><h1>UI/UX Designer &amp;<br/><span>Creative Developer</span></h1><p>I craft beautiful digital products that feel as good as they look. 5+ years crafting products for 40+ clients worldwide.</p><a href="#" class="btn">View My Work →</a><a href="#" class="btn ghost">Get in Touch</a></div><div class="work"><h2>Selected Projects</h2><div class="grid"><div class="item"><div class="thumb" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">📱</div><div class="info"><h3>FinPay Mobile App</h3><p>Mobile banking redesign — iOS &amp; Android</p></div></div><div class="item"><div class="thumb" style="background:linear-gradient(135deg,#0ea5e9,#6366f1)">🌐</div><div class="info"><h3>SaaS Dashboard</h3><p>Analytics platform UI for logistics startup</p></div></div><div class="item"><div class="thumb" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">🛒</div><div class="info"><h3>Artisan E-Commerce</h3><p>End-to-end Shopify design system</p></div></div></div></div><footer>© 2025 Alex Rivera · Designed by GrowthMachine Studio</footer></body></html>`,

  restaurant: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Bella Vista Bistro – Demo</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;600&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#fffdf7}nav{background:#1a0a00;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#d4af6a;font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700}nav .res{display:flex;gap:1.25rem}nav .res a{color:rgba(255,255,255,.7);text-decoration:none;font-size:.82rem}.hero{background:#1a0a00;min-height:60vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem;position:relative;overflow:hidden}.hero::before{content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=60') center/cover no-repeat;opacity:.3}.hero-inner{position:relative;z-index:1}.hero-inner .tag{display:inline-block;background:rgba(212,175,106,.15);color:#d4af6a;border:1px solid rgba(212,175,106,.4);padding:.35rem 1rem;border-radius:9999px;font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.25rem}.hero-inner h1{font-family:'Playfair Display',serif;font-size:3.2rem;color:#fff;line-height:1.1;margin-bottom:1rem}.hero-inner p{color:rgba(255,255,255,.75);font-size:.95rem;max-width:420px;margin:0 auto 2rem}.hero-inner .btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}.btn{display:inline-block;padding:.8rem 1.75rem;border-radius:9999px;font-weight:600;font-size:.85rem;text-decoration:none}.btn-gold{background:#d4af6a;color:#1a0a00}.btn-out{border:1px solid rgba(255,255,255,.35);color:#fff}.menu{padding:4rem 2rem;max-width:900px;margin:0 auto}.menu h2{font-family:'Playfair Display',serif;font-size:1.8rem;text-align:center;margin-bottom:.5rem}.menu .sub{text-align:center;color:#92400e;font-size:.85rem;margin-bottom:2.25rem}.items{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem}.item{background:#fff;border:1px solid #fde68a;border-radius:1rem;padding:1.25rem}.item .emoji{font-size:2rem;margin-bottom:.75rem}.item h3{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:.3rem}.item .price{color:#92400e;font-weight:700;font-size:.85rem;margin-bottom:.3rem}.item p{font-size:.78rem;color:#64748b;line-height:1.6}footer{background:#1a0a00;color:#92400e;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">🍷 Bella Vista Bistro</span><div class="res"><a href="#">Menu</a><a href="#">Reservations</a><a href="#">About</a></div></nav><div class="hero"><div class="hero-inner"><div class="tag">🌿 Farm-to-Table Italian Cuisine</div><h1>Where Every Meal<br/>Tells a Story</h1><p>Handcrafted pasta, wood-fired pizzas and seasonal Italian flavours in the heart of the city.</p><div class="btns"><a href="#" class="btn btn-gold">📅 Reserve a Table</a><a href="#" class="btn btn-out">View Full Menu</a></div></div></div><div class="menu"><h2>Tonight's Highlights</h2><p class="sub">Crafted fresh daily from local ingredients</p><div class="items"><div class="item"><div class="emoji">🍝</div><h3>Tagliatelle al Ragù</h3><div class="price">£14.50</div><p>Slow-cooked beef and pork ragù with hand-rolled egg pasta and aged Parmigiano.</p></div><div class="item"><div class="emoji">🍕</div><h3>Margherita Verace</h3><div class="price">£12.00</div><p>San Marzano tomato, fior di latte mozzarella, fresh basil — fired at 450°C.</p></div><div class="item"><div class="emoji">🦑</div><h3>Grilled Calamari</h3><div class="price">£11.00</div><p>Lemon-herb marinated calamari with house aioli and charred lemon.</p></div></div></div><footer>© 2025 Bella Vista Bistro · Designed by GrowthMachine Studio</footer></body></html>`,

  agency: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Nova Digital – Agency Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#020617;color:#e2e8f0}nav{padding:1.25rem 2.5rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.06)}nav .logo{font-weight:900;font-size:1.1rem;background:linear-gradient(90deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.nav-cta{background:linear-gradient(135deg,#38bdf8,#818cf8);color:#020617;padding:.55rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.82rem;text-decoration:none}.hero{padding:6rem 2rem;max-width:1000px;margin:0 auto;text-align:center}.badge{display:inline-flex;align-items:center;gap:.4rem;background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:.4rem 1rem;border-radius:9999px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1.5rem}.hero h1{font-size:3.5rem;font-weight:900;line-height:1.05;margin-bottom:1.25rem}.hero h1 .grad{background:linear-gradient(90deg,#38bdf8,#818cf8,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.hero p{color:#94a3b8;font-size:1rem;max-width:520px;margin:0 auto 2.5rem;line-height:1.75}.cta-row{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}.btn-main{background:linear-gradient(135deg,#38bdf8,#818cf8);color:#020617;padding:.9rem 2rem;border-radius:9999px;font-weight:800;font-size:.9rem;text-decoration:none}.btn-ghost{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:.9rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none}.services{max-width:960px;margin:0 auto;padding:4rem 2rem}.services h2{font-size:1.6rem;font-weight:900;text-align:center;margin-bottom:.5rem}.services .sub{text-align:center;color:#64748b;font-size:.85rem;margin-bottom:2.5rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:1rem;padding:1.5rem}.card .ic{font-size:1.6rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.9rem;margin-bottom:.35rem}.card p{font-size:.78rem;color:#64748b;line-height:1.6}footer{text-align:center;padding:1.5rem;color:#334155;font-size:.78rem;border-top:1px solid rgba(255,255,255,.05)}</style></head><body><nav><span class="logo">◈ Nova Digital</span><a href="#" class="nav-cta">Start a Project</a></nav><div class="hero"><div class="badge">✦ Award-winning digital agency</div><h1>We Build Digital<br/><span class="grad">Experiences That Scale</span></h1><p>Strategy, design, and development for ambitious brands. From MVP to market leader — we ship products people love.</p><div class="cta-row"><a href="#" class="btn-main">View Our Work →</a><a href="#" class="btn-ghost">Talk to Us</a></div></div><div class="services"><h2>What We Do</h2><p class="sub">End-to-end digital services under one roof</p><div class="grid"><div class="card"><div class="ic">🎨</div><h3>UI/UX Design</h3><p>User-centred design systems and product experiences that convert.</p></div><div class="card"><div class="ic">⚙️</div><h3>Web Development</h3><p>Blazing-fast React, Next.js, and edge-native web applications.</p></div><div class="card"><div class="ic">📈</div><h3>Growth Marketing</h3><p>SEO, paid ads, and analytics stacks that drive measurable results.</p></div><div class="card"><div class="ic">🤖</div><h3>AI Integration</h3><p>LLM-powered features and automation built into your product.</p></div></div></div><footer>© 2025 Nova Digital · Designed by GrowthMachine Studio</footer></body></html>`,

  salon: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Glow Beauty Studio – Demo</title><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;color:#1e293b;background:#fdf2f8}nav{background:#701a75;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#f9a8d4;font-weight:800;font-size:1.2rem}nav .cta{background:#f472b6;color:#fff;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#701a75 0%,#d946ef 100%);color:#fff;padding:5rem 2rem;text-align:center}.hero h1{font-size:2.6rem;font-weight:800;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#f472b6;color:#fff;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;border:2px solid rgba(255,255,255,.4)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto}.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:.5rem}.section .sub{text-align:center;color:#a855f7;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:#fff;border:1px solid #f5d0fe;border-radius:1rem;padding:1.5rem}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem}.card p{font-size:.82rem;color:#64748b;line-height:1.6}footer{background:#701a75;color:#f9a8d4;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">✨ Glow Beauty Studio</span><a href="#" class="cta">Book Now</a></nav><div class="hero"><h1>Transform Your Look<br/>With Expert Stylists</h1><p>Premium hair styling, nail art, facials, and spa treatments in a relaxing atmosphere.</p><a href="#" class="btn">📅 Book Appointment</a><a href="#" class="btn outline">💬 WhatsApp Us</a></div><div class="section"><h2>Our Services</h2><p class="sub">Beauty and wellness solutions for every occasion</p><div class="cards"><div class="card"><div class="icon">💇‍♀️</div><h3>Hair Styling</h3><p>Cuts, coloring, keratin treatments, and bridal styling by certified professionals.</p></div><div class="card"><div class="icon">💅</div><h3>Nail Art</h3><p>Gel, acrylic, and classic manicure-pedicure with premium products.</p></div><div class="card"><div class="icon">🧖‍♀️</div><h3>Spa & Facials</h3><p>Relaxing facials, body wraps, and aromatherapy for total rejuvenation.</p></div></div></div><footer>© 2025 Glow Beauty Studio · Designed by GrowthMachine Studio</footer></body></html>`,

  medical: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>CarePoint Clinic – Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#f0fdfa}nav{background:#0e7490;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#fff;font-weight:800;font-size:1.2rem}nav .cta{background:#06b6d4;color:#fff;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#0e7490 0%,#0891b2 100%);color:#fff;padding:5rem 2rem;text-align:center}.hero h1{font-size:2.6rem;font-weight:800;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#06b6d4;color:#fff;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;border:2px solid rgba(255,255,255,.4)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto}.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:.5rem}.section .sub{text-align:center;color:#0891b2;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:#fff;border:1px solid #a5f3fc;border-radius:1rem;padding:1.5rem}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem}.card p{font-size:.82rem;color:#64748b;line-height:1.6}footer{background:#0e7490;color:#a5f3fc;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">🏥 CarePoint Clinic</span><a href="#" class="cta">Book Consultation</a></nav><div class="hero"><h1>Compassionate Care<br/>For Your Whole Family</h1><p>Board-certified physicians providing comprehensive checkups, diagnostics, and preventive care.</p><a href="#" class="btn">📅 Book Appointment</a><a href="#" class="btn outline">📞 Call Us</a></div><div class="section"><h2>Why Patients Trust Us</h2><p class="sub">Delivering excellence in healthcare with compassion</p><div class="cards"><div class="card"><div class="icon">👨‍⚕️</div><h3>Board Certified</h3><p>All physicians hold active board certifications with 15+ years of clinical experience.</p></div><div class="card"><div class="icon">🔬</div><h3>Modern Diagnostics</h3><p>State-of-the-art imaging, lab work, and telemedicine consultations.</p></div><div class="card"><div class="icon">❤️</div><h3>Caring Staff</h3><p>Friendly, multilingual teams ensuring a smooth and comfortable visit.</p></div></div></div><footer>© 2025 CarePoint Clinic · Designed by GrowthMachine Studio</footer></body></html>`,

  fitness: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Iron Forge Fitness – Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#fff;background:#0f0a00}nav{background:#1c1917;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#f97316;font-weight:900;font-size:1.2rem}nav .cta{background:#dc2626;color:#fff;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#1c1917 0%,#dc2626 100%);padding:5rem 2rem;text-align:center}.hero h1{font-size:2.6rem;font-weight:900;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#f97316;color:#fff;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;border:2px solid rgba(255,255,255,.4)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto;color:#e2e8f0}.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:.5rem;color:#fff}.section .sub{text-align:center;color:#f97316;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:1rem;padding:1.5rem}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem;color:#fff}.card p{font-size:.82rem;color:#94a3b8;line-height:1.6}footer{background:#1c1917;color:#78716c;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">🔥 Iron Forge Fitness</span><a href="#" class="cta">Free Trial</a></nav><div class="hero"><h1>Transform Your Body<br/>Unlock Your Potential</h1><p>Certified trainers, modern equipment, and flexible plans. Start your free trial today.</p><a href="#" class="btn">💪 Start Free Trial</a><a href="#" class="btn outline">📞 Call Us</a></div><div class="section"><h2>Why Members Choose Us</h2><p class="sub">Everything you need for your fitness journey</p><div class="cards"><div class="card"><div class="icon">🏋️</div><h3>Certified Trainers</h3><p>NASM & ACE certified coaches create personalized workout and nutrition plans.</p></div><div class="card"><div class="icon">⚙️</div><h3>Modern Equipment</h3><p>Top-of-the-line cardio, strength, and functional training equipment.</p></div><div class="card"><div class="icon">📋</div><h3>Flexible Plans</h3><p>No lock-in contracts. Daily, monthly, and annual plans to suit your budget.</p></div></div></div><footer>© 2025 Iron Forge Fitness · Designed by GrowthMachine Studio</footer></body></html>`,

  lawyer: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Sterling & Associates – Demo</title><link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#faf9f7}nav{background:#1e3a5f;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#c9a84c;font-family:'Lora',serif;font-weight:700;font-size:1.2rem}nav .cta{background:#c9a84c;color:#1e3a5f;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#1e3a5f 0%,#0f2942 100%);color:#fff;padding:5rem 2rem;text-align:center}.hero h1{font-family:'Lora',serif;font-size:2.6rem;font-weight:700;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#c9a84c;color:#1e3a5f;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.3)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto}.section h2{font-family:'Lora',serif;font-size:1.8rem;font-weight:700;text-align:center;margin-bottom:.5rem}.section .sub{text-align:center;color:#64748b;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:#fff;border:1px solid #e2e8f0;border-radius:1rem;padding:1.5rem;border-top:3px solid #c9a84c}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem}.card p{font-size:.82rem;color:#64748b;line-height:1.6}footer{background:#1e3a5f;color:#94a3b8;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">⚖️ Sterling & Associates</span><a href="#" class="cta">Free Consultation</a></nav><div class="hero"><h1>Experienced Counsel<br/>Protecting Your Rights</h1><p>Decades of courtroom experience across family law, business disputes, and criminal defense.</p><a href="#" class="btn">📞 Free Consultation</a><a href="#" class="btn outline">💬 WhatsApp Us</a></div><div class="section"><h2>Why Clients Choose Us</h2><p class="sub">Strength, integrity, and results in every case</p><div class="cards"><div class="card"><div class="icon">🏛️</div><h3>25+ Years Experience</h3><p>Our senior partners bring decades of courtroom expertise across multiple practice areas.</p></div><div class="card"><div class="icon">🤝</div><h3>Client-First Approach</h3><p>We listen first, then craft tailored legal strategies that protect your interests.</p></div><div class="card"><div class="icon">🏆</div><h3>Proven Track Record</h3><p>Hundreds of successful cases across civil, family, and commercial litigation.</p></div></div></div><footer>© 2025 Sterling & Associates · Designed by GrowthMachine Studio</footer></body></html>`,

  tutor: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>BrightMind Academy – Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#f5f3ff}nav{background:#5b21b6;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#c4b5fd;font-weight:800;font-size:1.2rem}nav .cta{background:#a78bfa;color:#fff;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 100%);color:#fff;padding:5rem 2rem;text-align:center}.hero h1{font-size:2.6rem;font-weight:800;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#a78bfa;color:#fff;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;border:2px solid rgba(255,255,255,.4)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto}.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:.5rem}.section .sub{text-align:center;color:#7c3aed;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:#fff;border:1px solid #ddd6fe;border-radius:1rem;padding:1.5rem}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem}.card p{font-size:.82rem;color:#64748b;line-height:1.6}footer{background:#5b21b6;color:#c4b5fd;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">📚 BrightMind Academy</span><a href="#" class="cta">Book a Session</a></nav><div class="hero"><h1>Expert Tutoring That<br/>Makes a Real Difference</h1><p>Personalized Math, Science, English, and test prep tutoring. Online and in-person sessions.</p><a href="#" class="btn">📅 Book a Session</a><a href="#" class="btn outline">💬 WhatsApp Us</a></div><div class="section"><h2>Why Parents Trust Us</h2><p class="sub">Building confident learners one session at a time</p><div class="cards"><div class="card"><div class="icon">👩‍🏫</div><h3>Certified Educators</h3><p>Qualified teachers with proven track records helping students excel academically.</p></div><div class="card"><div class="icon">📋</div><h3>Personalized Plans</h3><p>Every student gets a customized learning plan tailored to their strengths and goals.</p></div><div class="card"><div class="icon">🕐</div><h3>Flexible Scheduling</h3><p>Morning, evening, and weekend sessions available online or in-person.</p></div></div></div><footer>© 2025 BrightMind Academy · Designed by GrowthMachine Studio</footer></body></html>`,

  freelancer: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Priya Sharma – Freelancer Demo</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1e293b;background:#ecfdf5}nav{background:#065f46;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}nav .logo{color:#34d399;font-weight:800;font-size:1.2rem}nav .cta{background:#059669;color:#fff;padding:.5rem 1.25rem;border-radius:9999px;font-weight:700;font-size:.85rem;text-decoration:none}.hero{background:linear-gradient(135deg,#065f46 0%,#059669 100%);color:#fff;padding:5rem 2rem;text-align:center}.hero h1{font-size:2.6rem;font-weight:800;line-height:1.15;margin-bottom:1rem}.hero p{font-size:1rem;opacity:.85;max-width:520px;margin:0 auto 2rem}.hero .btn{display:inline-flex;align-items:center;gap:.5rem;background:#34d399;color:#065f46;padding:.85rem 2rem;border-radius:9999px;font-weight:700;font-size:.9rem;text-decoration:none;margin:.4rem}.hero .btn.outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.4)}.section{padding:4rem 2rem;max-width:960px;margin:0 auto}.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:.5rem}.section .sub{text-align:center;color:#059669;font-size:.9rem;margin-bottom:2.5rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}.card{background:#fff;border:1px solid #a7f3d0;border-radius:1rem;padding:1.5rem}.card .icon{font-size:1.8rem;margin-bottom:.75rem}.card h3{font-weight:700;font-size:.95rem;margin-bottom:.4rem}.card p{font-size:.82rem;color:#64748b;line-height:1.6}footer{background:#065f46;color:#6ee7b7;text-align:center;padding:1.5rem;font-size:.8rem}</style></head><body><nav><span class="logo">🎬 Priya Sharma</span><a href="#" class="cta">Hire Me</a></nav><div class="hero"><h1>Creative Professional<br/>Ready for Your Next Project</h1><p>5+ years crafting stunning videos and motion graphics for brands across 15 countries.</p><a href="#" class="btn">🤝 Hire Me</a><a href="#" class="btn outline">💬 WhatsApp</a></div><div class="section"><h2>Why Clients Choose Me</h2><p class="sub">Reliable, creative, and committed to your success</p><div class="cards"><div class="card"><div class="icon">🏆</div><h3>5+ Years Experience</h3><p>300+ projects delivered for clients across 15 countries with stellar reviews.</p></div><div class="card"><div class="icon">⚡</div><h3>Quick Turnaround</h3><p>Most projects completed within 48-72 hours without compromising quality.</p></div><div class="card"><div class="icon">💰</div><h3>Affordable Rates</h3><p>Transparent, project-based pricing. No hidden fees or hourly surprises.</p></div></div></div><footer>© 2025 Priya Sharma · Designed by GrowthMachine Studio</footer></body></html>`,
};

interface PreviewModalProps {
  template: TemplateDefinition;
  onClose: () => void;
  onUse: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ template, onClose, onUse }) => {
  const html = DEMO_PREVIEWS[template.id] || '<p style="padding:2rem;text-align:center;font-family:sans-serif;color:#64748b">Preview coming soon.</p>';
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm">
      {/* Modal Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X size={18} />
          </button>
          <span className="text-sm font-bold text-white">{template.name}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 uppercase">
            {template.category}
          </span>
        </div>
        <button
          onClick={onUse}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
        >
          Use This Template
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Fake Browser Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-[11px] text-slate-400 font-mono">
          lywuai.com/s/your-site-name · <span className="text-green-400">●</span> Live Preview
        </div>
      </div>

      {/* iframe Preview */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          title={`Preview: ${template.name}`}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      </div>
    </div>
  );
};

interface TemplateShowcaseProps {
  onUseTemplate: () => void;
}

export const TemplateShowcase: React.FC<TemplateShowcaseProps> = ({ onUseTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  const EMOJI: Record<string, string> = {
    business: '🏢',
    portfolio: '🎨',
    restaurant: '🍽️',
    agency: '🚀',
    salon: '💇‍♀️',
    medical: '🏥',
    fitness: '🔥',
    lawyer: '⚖️',
    tutor: '📚',
    freelancer: '🎬',
  };

  const COLORS: Record<string, string> = {
    business: 'from-blue-600 to-indigo-700',
    portfolio: 'from-violet-600 to-purple-700',
    restaurant: 'from-amber-600 to-orange-600',
    agency: 'from-cyan-500 to-sky-600',
    salon: 'from-fuchsia-600 to-pink-600',
    medical: 'from-teal-600 to-cyan-700',
    fitness: 'from-red-600 to-orange-600',
    lawyer: 'from-slate-700 to-blue-900',
    tutor: 'from-purple-600 to-indigo-700',
    freelancer: 'from-emerald-600 to-teal-700',
  };

  return (
    <>
      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            setPreviewTemplate(null);
            onUseTemplate();
          }}
        />
      )}

      {/* Section */}
      <section id="templates" className="py-16 sm:py-20 border-t border-slate-200">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-4">
            ✦ 10 Starter Templates • No login needed to preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Pick Your Template
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Choose from tailored templates for local services, healthcare, fitness, salons, legal, tutoring, and more. Preview any template live.
          </p>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col"
            >
              {/* Thumbnail / Colour Banner */}
              <div
                className={`relative h-32 bg-gradient-to-br ${COLORS[tpl.id] || 'from-slate-500 to-slate-700'} flex items-center justify-center`}
              >
                <span className="text-4xl">{EMOJI[tpl.id] || '🌐'}</span>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-black/35 text-white backdrop-blur-xs">
                  {tpl.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 mb-1">{tpl.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{tpl.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-bold text-xs transition"
                  >
                    <Eye size={12} />
                    Live Preview
                  </button>
                  <button
                    onClick={onUseTemplate}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Zap size={12} />
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-xs text-slate-500 mb-3">
            Every template includes floating WhatsApp & call buttons, contact inquiries, AI copywriting, and instant fast cloud hosting.
          </p>
          <button
            onClick={onUseTemplate}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5"
          >
            Start Building — $1/month only
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
};
