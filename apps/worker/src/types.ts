// Environment Bindings for Cloudflare Worker

export interface Env {
  DB: D1Database;
  MEDIA_DB: D1Database;
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENVIRONMENT?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  login?: string | null;
  name?: string | null;
  exp: number;
}

export type HonoVariables = {
  user: AuthPayload;
};
