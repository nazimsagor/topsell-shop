-- Newsletter subscribers.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS newsletters (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at DESC);
