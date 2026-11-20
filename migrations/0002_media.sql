-- Media Database (lywuai_media)
-- Stores client-resized WebP blobs (<=200KB each)

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  blob BLOB NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_site ON media(site_id);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media(owner_id);
