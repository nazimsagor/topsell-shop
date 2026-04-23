-- Coupons / discount codes
-- Run this once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS coupons (
  id                BIGSERIAL PRIMARY KEY,
  code              TEXT UNIQUE NOT NULL,
  discount_type     TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value    NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
  min_order_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_uses          INTEGER,                -- NULL = unlimited
  used_count        INTEGER NOT NULL DEFAULT 0,
  expires_at        TIMESTAMPTZ,            -- NULL = never expires
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code_upper ON coupons ((UPPER(code)));
CREATE INDEX IF NOT EXISTS idx_coupons_active     ON coupons (is_active) WHERE is_active = TRUE;

-- Persist the applied coupon + discount on each order so we can audit / report later.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount    NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Atomic usage increment (used by the order flow after a successful checkout).
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code TEXT)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE coupons
     SET used_count = used_count + 1
   WHERE UPPER(code) = UPPER(p_code);
$$;
