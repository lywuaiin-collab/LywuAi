-- Migration: 0004 — Support Tickets & Feedback Routing
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  category TEXT NOT NULL CHECK(category IN ('problem', 'complaint', 'suggestion', 'other')),
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  target_channel TEXT, -- 'whatsapp' for problem/complaint, 'telegram' for suggestion
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);
