import { z } from 'zod';

export const siteThemeSchema = z.object({
  primary: z.string().default('#2563eb'),
  accent: z.string().default('#f59e0b'),
  font: z.string().default('Inter'),
  logo_url: z.string().nullable().optional(),
});

export const siteSeoSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(250).default(''),
});

export const contactActionsSchema = z.object({
  enable_whatsapp: z.boolean().default(false),
  whatsapp_number: z.string().optional(),
  enable_call: z.boolean().default(false),
  call_number: z.string().optional(),
}).optional();

export const aiChatSchema = z.object({
  enabled: z.boolean().default(false),
  is_pro: z.boolean().default(false),
  bot_name: z.string().max(50).optional(),
  welcome_message: z.string().max(200).optional(),
}).optional();

export const heroSectionSchema = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().min(1),
  subhead: z.string().default(''),
  cta_label: z.string().default('Get Started'),
  cta_url: z.string().default('#contact'),
  image_url: z.string().nullable().optional(),
});

export const featureItemSchema = z.object({
  title: z.string(),
  text: z.string(),
  icon: z.string().optional(),
});

export const testimonialItemSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
});

export const menuItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.string(),
});

export const menuCategorySchema = z.object({
  category: z.string(),
  items: z.array(menuItemSchema),
});

export const projectItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  link: z.string().optional(),
  image_url: z.string().optional(),
});

export const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().default('/mo'),
  features: z.array(z.string()),
  cta_label: z.string().default('Choose Plan'),
  cta_url: z.string().default('#contact'),
  highlighted: z.boolean().optional(),
});

export const contactSectionSchema = z.object({
  enabled: z.boolean().default(true),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  form_enabled: z.boolean().default(true),
});

export const siteContentSchema = z.object({
  template_id: z.enum(['business', 'portfolio', 'restaurant', 'agency', 'salon', 'medical', 'fitness', 'lawyer', 'tutor', 'freelancer']),
  theme: siteThemeSchema,
  seo: siteSeoSchema,
  contact_actions: contactActionsSchema,
  ai_chat: aiChatSchema,
  hide_badge: z.boolean().default(false).optional(),
  sections: z.object({
    hero: heroSectionSchema,
    features: z.object({
      enabled: z.boolean().default(true),
      items: z.array(featureItemSchema),
    }).optional(),
    menu: z.object({
      enabled: z.boolean().default(true),
      categories: z.array(menuCategorySchema),
    }).optional(),
    projects: z.object({
      enabled: z.boolean().default(true),
      items: z.array(projectItemSchema),
    }).optional(),
    pricing: z.object({
      enabled: z.boolean().default(true),
      plans: z.array(pricingPlanSchema),
    }).optional(),
    testimonials: z.object({
      enabled: z.boolean().default(false),
      items: z.array(testimonialItemSchema),
    }).optional(),
    gallery: z.object({
      enabled: z.boolean().default(false),
      image_urls: z.array(z.string()),
    }).optional(),
    contact: contactSectionSchema,
  }),
});

export const submissionInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(25).optional(),
  message: z.string().min(1, 'Message is required').max(2000),
  turnstileToken: z.string().optional(),
});

export const aiGenerateInputSchema = z.object({
  template_id: z.enum(['business', 'portfolio', 'restaurant', 'agency', 'salon', 'medical', 'fitness', 'lawyer', 'tutor', 'freelancer']),
  description: z.string().min(5, 'Please provide at least a few words describing your business or website').max(1000),
});
