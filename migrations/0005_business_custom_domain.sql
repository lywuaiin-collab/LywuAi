-- Migration 0005: Add Custom Domain & Support Business Plan

-- 1. Add custom_domain to sites table
ALTER TABLE sites ADD COLUMN custom_domain TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_custom_domain ON sites(custom_domain);

-- 2. Upgrade subscriptions table to support 'business' plan & billing_cycle
CREATE TABLE IF NOT EXISTS subscriptions_new (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL UNIQUE,
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'business')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK(billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TEXT,
  current_period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO subscriptions_new (id, owner_id, razorpay_subscription_id, razorpay_customer_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
SELECT id, owner_id, razorpay_subscription_id, razorpay_customer_id, plan, status, current_period_start, current_period_end, created_at, updated_at FROM subscriptions;

DROP TABLE IF EXISTS subscriptions;
ALTER TABLE subscriptions_new RENAME TO subscriptions;

CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON subscriptions(owner_id);
