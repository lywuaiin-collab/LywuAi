-- Migration: 0003 — Subscriptions & Payments (Razorpay)

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL UNIQUE,
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  plan TEXT DEFAULT 'pro' CHECK(plan IN ('free', 'pro')),
  status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TEXT,
  current_period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  subscription_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'captured', 'failed', 'refunded')),
  method TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON payments(owner_id);
