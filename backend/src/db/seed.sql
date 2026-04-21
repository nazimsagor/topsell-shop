-- ============================================================
--  TopSell Shop — Seed Data
--  50 products across 10 categories
-- ============================================================

-- ============================================================
--  USERS
--  Passwords are bcrypt hashes of "Password@123"
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User',    'admin@topsell.shop',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Alice Johnson', 'alice@example.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
  ('Bob Smith',     'bob@example.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
  ('Carol White',   'carol@example.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
  ('David Brown',   'david@example.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- ============================================================
--  CATEGORIES  (10 top-level)
-- ============================================================
INSERT INTO categories (name, slug, image) VALUES
  ('Electronics',          'electronics',          'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
  ('Clothing',             'clothing',             'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
  ('Home & Garden',        'home-garden',          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'),
  ('Sports & Fitness',     'sports-fitness',       'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
  ('Books',                'books',                'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
  ('Beauty & Personal Care','beauty',              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'),
  ('Toys & Games',         'toys-games',           'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400'),
  ('Automotive',           'automotive',           'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'),
  ('Food & Grocery',       'food-grocery',         'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'),
  ('Health & Wellness',    'health-wellness',      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400');

-- ============================================================
--  PRODUCTS  (50 total, 5 per category)
--  category_id: 1=Electronics 2=Clothing 3=Home&Garden
--               4=Sports 5=Books 6=Beauty 7=Toys
--               8=Automotive 9=Food 10=Health
-- ============================================================

-- ── Electronics (cat 1) ────────────────────────────────────
INSERT INTO products (name, slug, description, price, old_price, stock, category_id, image, badge) VALUES

('ProBook Laptop 15"',
 'probook-laptop-15',
 'Powerful 15-inch laptop with Intel Core i7, 16 GB RAM, 512 GB SSD, and a stunning Full HD IPS display. Perfect for professionals and creatives.',
 999.99, 1199.99, 42,
 1, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 'Sale'),

('UltraPhone X12',
 'ultraphone-x12',
 'Flagship smartphone featuring a 6.7-inch AMOLED display, triple 108 MP camera system, 5 G connectivity, and 5000 mAh battery.',
 799.00, NULL, 130,
 1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 'New'),

('NoisePro Wireless Headphones',
 'noisepro-wireless-headphones',
 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Res Audio certification.',
 249.95, 299.95, 75,
 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'Hot'),

('SmartWatch Series 8',
 'smartwatch-series-8',
 'Advanced smartwatch with health monitoring, GPS, always-on display, and 18-hour battery. Water resistant to 50 m.',
 399.00, 449.00, 60,
 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 'Sale'),

('4K Webcam Pro',
 '4k-webcam-pro',
 'Ultra-sharp 4 K webcam with auto-focus, built-in ring light, and dual stereo microphones. Ideal for streaming and video calls.',
 129.99, NULL, 200,
 1, 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600', 'New'),

-- ── Clothing (cat 2) ───────────────────────────────────────

('Classic Oxford Shirt',
 'classic-oxford-shirt',
 'Timeless button-down Oxford shirt crafted from 100 % brushed cotton. Available in multiple colors. Machine washable.',
 49.99, 69.99, 300,
 2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 'Sale'),

('Slim-Fit Chino Trousers',
 'slim-fit-chino-trousers',
 'Modern slim-fit chinos made from stretch cotton blend. Versatile for casual and smart-casual occasions.',
 59.99, NULL, 180,
 2, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', NULL),

('Women''s Yoga Leggings',
 'womens-yoga-leggings',
 'High-waist performance leggings with moisture-wicking fabric, four-way stretch, and hidden waistband pocket.',
 39.99, 54.99, 250,
 2, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600', 'Hot'),

('Puffer Winter Jacket',
 'puffer-winter-jacket',
 'Lightweight yet warm puffer jacket filled with recycled down. Wind and water resistant outer shell.',
 129.00, 159.00, 90,
 2, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', 'Sale'),

('Graphic Print Hoodie',
 'graphic-print-hoodie',
 'Cozy fleece-lined hoodie with unique graphic print. Kangaroo pocket and adjustable drawstring hood.',
 44.99, NULL, 320,
 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'New'),

-- ── Home & Garden (cat 3) ──────────────────────────────────

('Ergonomic Office Chair',
 'ergonomic-office-chair',
 'Fully adjustable ergonomic chair with lumbar support, breathable mesh back, and 360° swivel. Supports up to 150 kg.',
 349.00, 429.00, 35,
 3, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', 'Sale'),

('LED Desk Lamp',
 'led-desk-lamp',
 'Eye-care LED desk lamp with 5 color temperatures, 10 brightness levels, USB charging port, and touch control.',
 44.99, NULL, 160,
 3, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', NULL),

('Ceramic Plant Pot Set (3-pack)',
 'ceramic-plant-pot-set',
 'Set of three modern ceramic pots with drainage holes and bamboo trays. Perfect for succulents and herbs.',
 34.99, 44.99, 120,
 3, 'https://images.unsplash.com/photo-1520302519878-3b6a0d764c32?w=600', 'New'),

('Memory Foam Pillow',
 'memory-foam-pillow',
 'Orthopedic memory foam pillow with cooling gel layer and washable bamboo cover. Relieves neck and shoulder pain.',
 59.99, 79.99, 95,
 3, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600', 'Hot'),

('Non-Stick Cookware Set (7-piece)',
 'nonstick-cookware-set-7pc',
 'Professional-grade non-stick cookware set including frying pans, saucepans, and stockpot. Dishwasher safe and oven safe to 230 °C.',
 119.99, 149.99, 55,
 3, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600', 'Sale'),

-- ── Sports & Fitness (cat 4) ───────────────────────────────

('Adjustable Dumbbell Set',
 'adjustable-dumbbell-set',
 'Space-saving adjustable dumbbell set ranging from 2.5 kg to 25 kg per dumbbell. Quick-change dial mechanism.',
 299.00, 359.00, 40,
 4, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600', 'Hot'),

('Yoga Mat Premium',
 'yoga-mat-premium',
 'Eco-friendly natural rubber yoga mat with alignment lines, non-slip surface, and carry strap. 6 mm thick for joint support.',
 59.99, NULL, 210,
 4, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600', 'New'),

('Running Shoes AirBoost',
 'running-shoes-airboost',
 'Lightweight responsive running shoes with energy-return foam midsole, breathable knit upper, and carbon fibre plate.',
 139.99, 169.99, 85,
 4, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'Sale'),

('Resistance Band Kit (5-pack)',
 'resistance-band-kit-5pack',
 'Set of five latex resistance bands in varying strengths. Includes carry bag, handles, door anchor, and ankle straps.',
 29.99, 39.99, 340,
 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', NULL),

('Folding Exercise Bike',
 'folding-exercise-bike',
 'Compact folding exercise bike with 8-level magnetic resistance, LCD display, and heart rate sensors. Folds flat for storage.',
 249.00, 299.00, 28,
 4, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600', 'Sale'),

-- ── Books (cat 5) ──────────────────────────────────────────

('Atomic Habits',
 'atomic-habits',
 'James Clear''s #1 New York Times bestseller on how tiny changes create remarkable results. Practical framework for building good habits.',
 16.99, NULL, 500,
 5, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 'Hot'),

('The Psychology of Money',
 'psychology-of-money',
 'Morgan Housel explores the strange ways people think about money and how to make better financial decisions.',
 14.99, 18.99, 420,
 5, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600', NULL),

('Deep Work',
 'deep-work',
 'Cal Newport''s rules for focused success in a distracted world. Learn to produce at an elite level.',
 15.99, NULL, 380,
 5, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 'New'),

('Sapiens: A Brief History',
 'sapiens-brief-history',
 'Yuval Noah Harari''s landmark narrative of humankind from the Stone Age through the twenty-first century.',
 17.99, 22.99, 460,
 5, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600', 'Sale'),

('The Pragmatic Programmer',
 'pragmatic-programmer',
 'A classic guide for developers covering coding philosophy, career development, and practical techniques. 20th anniversary edition.',
 49.99, NULL, 290,
 5, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600', NULL),

-- ── Beauty & Personal Care (cat 6) ─────────────────────────

('Vitamin C Serum 30 ml',
 'vitamin-c-serum-30ml',
 'Brightening 20 % vitamin C serum with hyaluronic acid and vitamin E. Fades dark spots, evens skin tone, and boosts collagen.',
 34.99, 44.99, 175,
 6, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600', 'Hot'),

('Retinol Night Cream',
 'retinol-night-cream',
 'Advanced anti-ageing night cream with 0.3 % retinol, peptides, and niacinamide. Visibly reduces fine lines in 4 weeks.',
 42.99, NULL, 140,
 6, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600', 'New'),

('Natural Lip Palette (12-shade)',
 'natural-lip-palette-12',
 'Creamy long-wear lip palette with 12 neutral and bold shades. Vegan, cruelty-free, and transfer-proof formula.',
 24.99, 34.99, 220,
 6, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', 'Sale'),

('Argan Oil Hair Mask',
 'argan-oil-hair-mask',
 'Intensive repair hair mask with pure Moroccan argan oil, keratin, and silk proteins. Restores shine and eliminates frizz.',
 19.99, NULL, 195,
 6, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', NULL),

('Electric Facial Cleansing Brush',
 'electric-facial-cleansing-brush',
 'Sonic facial brush with 3 modes, waterproof body, and ultra-soft silicone bristles. Removes 99.5 % of dirt and makeup.',
 49.99, 64.99, 88,
 6, 'https://images.unsplash.com/photo-1556228720-da39c8006895?w=600', 'Hot'),

-- ── Toys & Games (cat 7) ───────────────────────────────────

('STEM Building Blocks 500 pc',
 'stem-building-blocks-500pc',
 'Creative engineering building set with 500 colourful interlocking pieces. Develops spatial reasoning and problem solving. Ages 6+.',
 39.99, 49.99, 145,
 7, 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600', 'New'),

('Remote Control Monster Truck',
 'rc-monster-truck',
 'Off-road 4WD monster truck with 2.4 GHz control, independent suspension, and 40 km/h top speed. Includes USB charger.',
 59.99, NULL, 110,
 7, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Hot'),

('Strategy Board Game — Catan',
 'strategy-board-game-catan',
 'Award-winning strategy board game for 3–4 players. Trade, build, and settle your way to victory on the island of Catan.',
 44.99, 54.99, 80,
 7, 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=600', NULL),

('Wooden Puzzle 1000 pc — World Map',
 'wooden-puzzle-1000pc-world-map',
 'Premium quality 1000-piece wooden puzzle featuring a detailed world map illustration. Frame-worthy when complete.',
 29.99, NULL, 165,
 7, 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600', 'New'),

('Action Figure Collector Set',
 'action-figure-collector-set',
 'Set of 6 highly detailed die-cast action figures with 20+ articulation points. Collector''s edition with display stand.',
 79.99, 99.99, 55,
 7, 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600', 'Sale'),

-- ── Automotive (cat 8) ─────────────────────────────────────

('Dash Cam 4K Dual Lens',
 'dash-cam-4k-dual-lens',
 'Front and rear 4 K dash cam with night vision, GPS, Wi-Fi, and 170° wide angle. Loop recording with G-sensor.',
 149.99, 189.99, 70,
 8, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', 'Hot'),

('Car Phone Mount MagSafe',
 'car-phone-mount-magsafe',
 'Strong magnetic car phone mount compatible with MagSafe iPhones. One-hand operation, 360° rotation, dashboard and vent clip.',
 29.99, NULL, 310,
 8, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600', 'New'),

('Tyre Inflator Portable',
 'tyre-inflator-portable',
 'Cordless portable tyre inflator with digital pressure gauge, auto-shutoff, and LED emergency light. Inflates a flat tyre in 5 min.',
 69.99, 89.99, 120,
 8, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Sale'),

('Premium Microfibre Car Care Kit',
 'microfibre-car-care-kit',
 'Complete car detailing kit with 8 microfibre cloths, foam applicators, interior brush, and window squeegee.',
 34.99, NULL, 190,
 8, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', NULL),

('OBD II Bluetooth Scanner',
 'obd2-bluetooth-scanner',
 'Plug-and-play OBD II scanner pairs with iOS and Android. Read and clear fault codes, live sensor data, and performance monitoring.',
 44.99, 59.99, 95,
 8, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', 'Hot'),

-- ── Food & Grocery (cat 9) ─────────────────────────────────

('Cold-Pressed Olive Oil Extra Virgin 1 L',
 'cold-pressed-olive-oil-1l',
 'Premium single-origin extra virgin olive oil cold-pressed from hand-picked Greek Koroneiki olives. Rich, fruity, low acidity.',
 18.99, NULL, 280,
 9, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', NULL),

('Organic Matcha Green Tea Powder 100 g',
 'organic-matcha-powder-100g',
 'Ceremonial-grade organic matcha from Uji, Japan. Vibrant green colour, umami-rich flavour, and high antioxidant content.',
 24.99, 29.99, 200,
 9, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', 'New'),

('Mixed Nuts & Dried Fruit Hamper 1 kg',
 'mixed-nuts-dried-fruit-1kg',
 'Generous 1 kg selection of roasted almonds, cashews, walnuts, cranberries, and mango pieces. No added sugar or preservatives.',
 32.99, NULL, 150,
 9, 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600', 'Hot'),

('Artisan Dark Chocolate Gift Box 24-pc',
 'artisan-dark-chocolate-gift-box',
 'Hand-crafted single-origin 72 % dark chocolate bonbons in 24 unique flavour combinations. Presented in an elegant gift box.',
 29.99, 37.99, 120,
 9, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600', 'Sale'),

('Himalayan Pink Salt Mill',
 'himalayan-pink-salt-mill',
 'Refillable ceramic grinder pre-filled with 300 g of pure Himalayan pink salt. Adjustable coarseness with ergonomic grip.',
 14.99, NULL, 340,
 9, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', NULL),

-- ── Health & Wellness (cat 10) ─────────────────────────────

('Whey Protein Isolate Chocolate 2 kg',
 'whey-protein-isolate-chocolate-2kg',
 '90 % protein per serving, cold-processed whey isolate with no artificial sweeteners. 27 g protein per 30 g serving.',
 69.99, 84.99, 95,
 10, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'Sale'),

('Omega-3 Fish Oil 1000 mg (180 caps)',
 'omega-3-fish-oil-1000mg-180caps',
 'Pharmaceutical-grade omega-3 fish oil with 660 mg EPA and 440 mg DHA per serving. Molecularly distilled, heavy-metal free.',
 29.99, NULL, 210,
 10, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600', NULL),

('Meditation & Yoga Block Set',
 'meditation-yoga-block-set',
 'Set of two high-density foam yoga blocks with a meditation cushion. Supports alignment and deepens stretches.',
 39.99, 49.99, 130,
 10, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600', 'New'),

('Digital Body Weight Scale',
 'digital-body-weight-scale',
 'Precision digital scale measuring weight, BMI, body fat, muscle mass, and bone density via bioelectrical impedance. App sync.',
 49.99, 64.99, 115,
 10, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600', 'Hot'),

('Vitamin D3 + K2 Drops 50 ml',
 'vitamin-d3-k2-drops-50ml',
 'Synergistic vitamin D3 and K2 liquid formula for immune support and bone health. 2000 IU D3 per serving, zero additives.',
 22.99, NULL, 260,
 10, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600', NULL);

-- ============================================================
--  SAMPLE ORDERS & ITEMS (for the 3 demo customers)
-- ============================================================
INSERT INTO orders (user_id, total, status, created_at) VALUES
  (2, 1249.94, 'delivered',  NOW() - INTERVAL '30 days'),
  (2,   89.98, 'shipped',    NOW() - INTERVAL '5 days'),
  (3,  179.97, 'processing', NOW() - INTERVAL '2 days'),
  (4,  349.00, 'pending',    NOW() - INTERVAL '1 day');

-- Order 1 items: laptop + headphones
INSERT INTO order_items (order_id, product_id, qty, price) VALUES
  (1, 1, 1, 999.99),
  (1, 3, 1, 249.95);

-- Order 2 items: Oxford shirt + hoodie
INSERT INTO order_items (order_id, product_id, qty, price) VALUES
  (2, 6, 1, 49.99),
  (2, 10, 1, 44.99);

-- Order 3 items: yoga mat + resistance bands + protein
INSERT INTO order_items (order_id, product_id, qty, price) VALUES
  (3, 17, 1, 59.99),
  (3, 19, 2, 29.99),
  (3, 46, 1, 69.99);

-- Order 4 items: ergonomic chair
INSERT INTO order_items (order_id, product_id, qty, price) VALUES
  (4, 11, 1, 349.00);

-- ============================================================
--  SAMPLE CART & WISHLIST
-- ============================================================
INSERT INTO cart (user_id, product_id, qty) VALUES
  (3, 2,  1),   -- Alice has UltraPhone in cart
  (3, 26, 2),   -- Alice has Vitamin C Serum x2
  (4, 1,  1),   -- Bob has laptop in cart
  (4, 16, 1);   -- Bob has dumbbells in cart

INSERT INTO wishlist (user_id, product_id) VALUES
  (2, 4),   -- Alice wishlisted SmartWatch
  (2, 11),  -- Alice wishlisted Ergonomic Chair
  (3, 1),   -- Bob wishlisted Laptop
  (3, 21),  -- Bob wishlisted Atomic Habits
  (4, 26),  -- Carol wishlisted Vitamin C Serum
  (4, 46);  -- Carol wishlisted Whey Protein
