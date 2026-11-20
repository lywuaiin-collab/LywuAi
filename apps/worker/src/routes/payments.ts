/**
 * Payment Routes — Razorpay Integration
 * Covers: UPI, Credit/Debit Cards, Net Banking, Wallets, EMI
 *
 * All Razorpay API calls use fetch() — 100% Cloudflare Workers compatible.
 */

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env, HonoVariables } from '../types';

export const paymentRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function nanoid(len = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) id += chars[bytes[i] % chars.length];
  return id;
}

function razorpayAuth(keyId: string, keySecret: string): string {
  return 'Basic ' + btoa(`${keyId}:${keySecret}`);
}

async function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const computed = Array.from(new Uint8Array(sigBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return computed === signature;
  } catch {
    return false;
  }
}

// Pricing Constants (INR)
// Pro Plan: ₹249/mo (24,900 paise) or ₹2,499/yr (249,900 paise — Save 17%)
// Business Plan: ₹799/mo (79,900 paise) or ₹7,999/yr (799,900 paise — Save ~17%)
const PRICING = {
  pro: {
    monthly: 24900,
    yearly: 249900,
  },
  business: {
    monthly: 79900,
    yearly: 799900,
  },
} as const;

const PRO_CURRENCY = 'INR';

// ────────────────────────────────────────────────────────────
// POST /api/payments/create-order
// Creates a Razorpay order for Pro or Business (Monthly or Yearly)
// ────────────────────────────────────────────────────────────
paymentRoutes.post('/create-order', authMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;

  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  const reqBody = await c.req
    .json<{ plan?: 'pro' | 'business'; period?: 'monthly' | 'yearly' }>()
    .catch(() => ({} as { plan?: 'pro' | 'business'; period?: 'monthly' | 'yearly' }));
  const plan = reqBody.plan === 'business' ? 'business' : 'pro';
  const period = reqBody.period === 'yearly' ? 'yearly' : 'monthly';
  const amountPaise = PRICING[plan][period];

  if (!keyId || !keySecret) {
    // Dev mode: return a mock order so the frontend can display UI
    return c.json({
      order_id: 'order_DEV_MODE_' + nanoid(10),
      amount: amountPaise,
      currency: PRO_CURRENCY,
      key_id: 'rzp_test_placeholder',
      plan,
      period,
      dev_mode: true,
    });
  }

  try {
    const receiptId = `rcpt_${user.userId}_${Date.now()}`;
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: razorpayAuth(keyId, keySecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: PRO_CURRENCY,
        receipt: receiptId,
        notes: {
          user_id: user.userId,
          email: user.email,
          plan,
          period,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Razorpay create-order error:', err);
      return c.json({ error: 'Failed to create payment order' }, 502);
    }

    const order = await response.json<{ id: string; amount: number; currency: string }>();

    return c.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      plan,
      period,
    });
  } catch (err: any) {
    console.error('create-order exception:', err.message);
    return c.json({ error: 'Internal error' }, 500);
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/payments/verify
// Verifies Razorpay signature after client-side checkout success
// ────────────────────────────────────────────────────────────
paymentRoutes.post('/verify', authMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  const body = await c.req.json<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan?: 'pro' | 'business';
    period?: 'monthly' | 'yearly';
  }>();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  const plan = body.plan === 'business' ? 'business' : 'pro';
  const period = body.period === 'yearly' ? 'yearly' : 'monthly';
  const amountPaise = PRICING[plan][period];

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return c.json({ error: 'Missing payment fields' }, 400);
  }

  // In dev mode (no secret), skip verification and activate directly
  if (keySecret) {
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const valid = await verifyRazorpaySignature(payload, razorpay_signature, keySecret);
    if (!valid) {
      return c.json({ error: 'Invalid payment signature' }, 400);
    }
  }

  // Calculate subscription period: +30 days for monthly, +365 days for yearly
  const now = new Date();
  const periodDays = period === 'yearly' ? 365 : 30;
  const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  const subId = nanoid();
  const pmtId = nanoid();

  try {
    // Upsert subscription
    await env.DB.prepare(
      `INSERT INTO subscriptions (id, owner_id, plan, billing_cycle, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(owner_id) DO UPDATE SET
         status = 'active',
         plan = excluded.plan,
         billing_cycle = excluded.billing_cycle,
         current_period_start = excluded.current_period_start,
         current_period_end = excluded.current_period_end,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(subId, user.userId, plan, period, now.toISOString(), periodEnd.toISOString())
      .run();

    // Fetch subscription id for payment record
    const sub = await env.DB.prepare('SELECT id FROM subscriptions WHERE owner_id = ?')
      .bind(user.userId)
      .first<{ id: string }>();

    // Record payment
    await env.DB.prepare(
      `INSERT INTO payments (id, owner_id, subscription_id, razorpay_payment_id, razorpay_order_id, amount, currency, status, method, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'captured', 'razorpay', CURRENT_TIMESTAMP)`
    )
      .bind(pmtId, user.userId, sub?.id || null, razorpay_payment_id, razorpay_order_id, amountPaise, PRO_CURRENCY)
      .run();

    return c.json({
      success: true,
      subscription: {
        status: 'active',
        plan,
        billing_cycle: period,
        current_period_end: periodEnd.toISOString(),
      },
    });
  } catch (err: any) {
    console.error('verify payment DB error:', err.message);
    return c.json({ error: 'Failed to activate subscription' }, 500);
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/payments/status
// Returns current subscription status for logged-in user
// ────────────────────────────────────────────────────────────
paymentRoutes.get('/status', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const sub = await c.env.DB.prepare(
      'SELECT * FROM subscriptions WHERE owner_id = ?'
    )
      .bind(user.userId)
      .first<{
        id: string;
        plan: 'free' | 'pro' | 'business';
        billing_cycle: 'monthly' | 'yearly';
        status: string;
        current_period_start: string | null;
        current_period_end: string | null;
        created_at: string;
        updated_at: string;
      }>();

    // Calculate 15-day Free Trial status based on user account creation date
    const userRow = await c.env.DB.prepare('SELECT created_at FROM users WHERE id = ?')
      .bind(user.userId)
      .first<{ created_at: string }>();

    const registeredAt = userRow?.created_at ? new Date(userRow.created_at) : new Date();
    const trialEnd = new Date(registeredAt.getTime() + 15 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const trialExpired = now > trialEnd;

    const trial = {
      active: !trialExpired,
      days_left: trialDaysLeft,
      expired: trialExpired,
      expires_at: trialEnd.toISOString(),
    };

    if (!sub) {
      return c.json({ subscription: null, trial });
    }

    // Auto-expire: if past period_end and status = active → set past_due
    if (sub.status === 'active' && sub.current_period_end) {
      const expiry = new Date(sub.current_period_end);
      if (expiry < now) {
        await c.env.DB.prepare(
          "UPDATE subscriptions SET status = 'past_due', updated_at = CURRENT_TIMESTAMP WHERE owner_id = ?"
        )
          .bind(user.userId)
          .run();
        sub.status = 'past_due';
      }
    }

    return c.json({ subscription: sub, trial });
  } catch (err: any) {
    console.error('status error:', err.message);
    return c.json({ error: 'Failed to fetch subscription' }, 500);
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/payments/cancel
// Cancels the subscription (marks as cancelled in DB)
// ────────────────────────────────────────────────────────────
paymentRoutes.post('/cancel', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    await c.env.DB.prepare(
      "UPDATE subscriptions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE owner_id = ?"
    )
      .bind(user.userId)
      .run();

    return c.json({ success: true, message: 'Subscription cancelled. Access remains until your period ends.' });
  } catch (err: any) {
    return c.json({ error: 'Failed to cancel subscription' }, 500);
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// Public — Razorpay sends events here (signature-verified)
// Events handled: payment.captured, subscription.activated, subscription.cancelled
// ────────────────────────────────────────────────────────────
paymentRoutes.post('/webhook', async (c) => {
  const env = c.env;
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

  const rawBody = await c.req.text();
  const signature = c.req.header('x-razorpay-signature') || '';

  // Verify webhook authenticity
  if (webhookSecret) {
    const valid = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
    if (!valid) {
      return c.json({ error: 'Invalid webhook signature' }, 400);
    }
  }

  let event: { event: string; payload: Record<string, any> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const eventType = event.event;

  try {
    if (eventType === 'payment.captured') {
      // Extract notes to find user_id
      const payment = event.payload?.payment?.entity;
      const userId = payment?.notes?.user_id;
      if (userId) {
        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await env.DB.prepare(
          `INSERT INTO subscriptions (id, owner_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES (?, ?, 'pro', 'active', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT(owner_id) DO UPDATE SET
             status = 'active', plan = 'pro',
             current_period_start = excluded.current_period_start,
             current_period_end = excluded.current_period_end,
             updated_at = CURRENT_TIMESTAMP`
        )
          .bind(nanoid(), userId, now.toISOString(), periodEnd.toISOString())
          .run();
      }
    } else if (eventType === 'subscription.activated') {
      const sub = event.payload?.subscription?.entity;
      const userId = sub?.notes?.user_id;
      if (userId) {
        const startAt = sub?.current_start ? new Date(sub.current_start * 1000).toISOString() : new Date().toISOString();
        const endAt = sub?.current_end ? new Date(sub.current_end * 1000).toISOString() : null;
        await env.DB.prepare(
          `INSERT INTO subscriptions (id, owner_id, razorpay_subscription_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES (?, ?, ?, 'pro', 'active', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT(owner_id) DO UPDATE SET
             razorpay_subscription_id = excluded.razorpay_subscription_id,
             status = 'active', plan = 'pro',
             current_period_start = excluded.current_period_start,
             current_period_end = excluded.current_period_end,
             updated_at = CURRENT_TIMESTAMP`
        )
          .bind(nanoid(), userId, sub?.id || null, startAt, endAt)
          .run();
      }
    } else if (eventType === 'subscription.cancelled') {
      const sub = event.payload?.subscription?.entity;
      const userId = sub?.notes?.user_id;
      if (userId) {
        await env.DB.prepare(
          "UPDATE subscriptions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE owner_id = ?"
        )
          .bind(userId)
          .run();
      }
    }
  } catch (err: any) {
    console.error('Webhook DB error:', err.message);
    // Return 200 anyway so Razorpay doesn't retry indefinitely
  }

  return c.json({ received: true });
});
