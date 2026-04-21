-- ============================================================
--  TopSell Shop — Database Schema
-- ============================================================

-- Drop tables in dependency order
DROP TABLE IF EXISTS wishlist      CASCADE;
DROP TABLE IF EXISTS cart          CASCADE;
DROP TABLE IF EXISTS order_items   CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS products      CASCADE;
DROP TABLE IF EXISTS categories    CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- ============================================================
--  USERS
-- ============================================================
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,
  role       VARCHAR(20)         NOT NULL DEFAULT 'customer'
               CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================================================
--  CATEGORIES  (self-referencing for sub-categories)
-- ============================================================
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) UNIQUE NOT NULL,
  image     VARCHAR(500),
  parent_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
--  PRODUCTS
-- ============================================================
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  slug        VARCHAR(255)   UNIQUE NOT NULL,
  description TEXT,
  price       NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
  old_price   NUMERIC(10,2)           CHECK (old_price >= 0),
  stock       INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id INT            REFERENCES categories(id) ON DELETE SET NULL,
  image       VARCHAR(500),
  badge       VARCHAR(50)             -- e.g. 'New', 'Sale', 'Hot', 'Featured'
);

-- ============================================================
--  ORDERS
-- ============================================================
CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INT           REFERENCES users(id) ON DELETE SET NULL,
  total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status     VARCHAR(30)   NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT           NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id INT                    REFERENCES products(id) ON DELETE SET NULL,
  qty        INT           NOT NULL CHECK (qty > 0),
  price      NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

-- ============================================================
--  CART
-- ============================================================
CREATE TABLE cart (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty        INT NOT NULL DEFAULT 1 CHECK (qty > 0),
  UNIQUE (user_id, product_id)
);

-- ============================================================
--  WISHLIST
-- ============================================================
CREATE TABLE wishlist (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (user_id, product_id)
);

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_slug      ON products(slug);
CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_cart_user          ON cart(user_id);
CREATE INDEX idx_wishlist_user      ON wishlist(user_id);
