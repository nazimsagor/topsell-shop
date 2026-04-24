-- Product reviews
-- Run this once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS reviews (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One review per user per product (users can update their own).
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user    ON reviews (user_id);
