-- Admin extras: banners + key/value site settings.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS banners (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  subtitle    TEXT,
  image       TEXT NOT NULL,
  link_url    TEXT,
  cta_label   TEXT,
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);

CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sensible defaults; ON CONFLICT keeps existing values.
INSERT INTO site_settings(key, value) VALUES
  ('store_name',        '"TopSell"'::jsonb),
  ('store_email',       '"hello@topsell.shop"'::jsonb),
  ('store_phone',       '"+8801797515010"'::jsonb),
  ('store_address',     '"Banani, Dhaka, Bangladesh"'::jsonb),
  ('social_facebook',   '"https://facebook.com/topsell"'::jsonb),
  ('social_instagram',  '"https://instagram.com/topsell"'::jsonb),
  ('social_youtube',    '""'::jsonb),
  ('free_ship_threshold','5000'::jsonb),
  ('tax_rate',          '0'::jsonb)
ON CONFLICT (key) DO NOTHING;
