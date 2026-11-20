// Shared Type Definitions for LywuAi

export interface User {
  id: string;
  email: string;
  github_id?: number | null;
  login?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  telegram_chat_id?: string | null;
  created_at: string;
}

export interface Site {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  custom_domain?: string | null;
  template_id: string;
  content_json: string;
  published_html?: string | null;
  published_content_json?: string | null;
  published_at?: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  site_id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  read: number;
  created_at: string;
}

export interface MediaItem {
  id: string;
  site_id: string;
  owner_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

// Content JSON Shape for Website Templates
export interface SiteTheme {
  primary: string;
  accent: string;
  font: string;
  logo_url?: string | null;
}

export interface SiteSeo {
  title: string;
  description: string;
}

export interface ContactActions {
  enable_whatsapp: boolean;
  whatsapp_number?: string;
  enable_call: boolean;
  call_number?: string;
}

export interface AiChatConfig {
  enabled: boolean;
  is_pro?: boolean;
  bot_name?: string;
  welcome_message?: string;
}

export interface HeroSection {
  enabled: boolean;
  headline: string;
  subhead: string;
  cta_label: string;
  cta_url: string;
  image_url?: string | null;
}

export interface FeatureItem {
  title: string;
  text: string;
  icon?: string;
}

export interface FeaturesSection {
  enabled: boolean;
  items: FeatureItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsSection {
  enabled: boolean;
  items: TestimonialItem[];
}

export interface MenuItem {
  name: string;
  description: string;
  price: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface MenuSection {
  enabled: boolean;
  categories: MenuCategory[];
}

export interface ProjectItem {
  title: string;
  description: string;
  tags?: string[];
  link?: string;
  image_url?: string;
}

export interface ProjectsSection {
  enabled: boolean;
  items: ProjectItem[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta_label: string;
  cta_url: string;
  highlighted?: boolean;
}

export interface PricingSection {
  enabled: boolean;
  plans: PricingPlan[];
}

export interface ContactSection {
  enabled: boolean;
  email: string;
  phone?: string;
  address?: string;
  hours?: string;
  form_enabled: boolean;
}

export interface GallerySection {
  enabled: boolean;
  image_urls: string[];
}

export interface SiteSections {
  hero: HeroSection;
  features?: FeaturesSection;
  menu?: MenuSection;
  projects?: ProjectsSection;
  pricing?: PricingSection;
  testimonials?: TestimonialsSection;
  gallery?: GallerySection;
  contact: ContactSection;
}

export interface SiteContent {
  template_id: string;
  theme: SiteTheme;
  seo: SiteSeo;
  contact_actions?: ContactActions;
  ai_chat?: AiChatConfig;
  hide_badge?: boolean;
  sections: SiteSections;
}

export interface TrialStatus {
  active: boolean;
  days_left: number;
  expired: boolean;
  expires_at: string;
}

export interface Subscription {
  id: string;
  owner_id: string;
  razorpay_subscription_id?: string | null;
  razorpay_customer_id?: string | null;
  plan: 'free' | 'pro' | 'business';
  billing_cycle?: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  owner_id: string;
  subscription_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  method?: string | null;
  created_at: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'business' | 'portfolio' | 'restaurant' | 'agency' | 'salon' | 'medical' | 'fitness' | 'lawyer' | 'tutor' | 'freelancer';
  defaultContent: SiteContent;
  render: (content: SiteContent, options?: { turnstileSiteKey?: string; slug?: string }) => string;
}
