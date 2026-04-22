require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CATEGORY_IMAGES = {
  'video-surveillance':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
  'solar-lighting':      'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600',
  'fitness':             'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  'kitchen':             'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
  'pets':                'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  'camping':             'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
  'garden':              'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
  'christmas':           'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600',
  'cosmetics':           'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
  'bathroom':            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600',
};

const img = (categorySlug, productName) =>
  CATEGORY_IMAGES[categorySlug] ||
  `https://picsum.photos/seed/${encodeURIComponent(slugify(productName))}/600/600`;

const slugify = (s) =>
  s.toLowerCase().replace(/['']/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const BADGES = ['Hot', 'Sale', 'New', null, null];
const pickBadge = () => BADGES[Math.floor(Math.random() * BADGES.length)];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const price = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
const maybeOld = (p) => (Math.random() < 0.6 ? +(p * (1 + rand(10, 30) / 100)).toFixed(2) : null);

const PRODUCTS = {
  'aroma-diffusers': [
    ['Ultrasonic Aroma Diffuser 300ml', 'Silent ultrasonic mist diffuser with 7 LED colors. Covers up to 300 sq ft. Auto shut-off when water runs out.', 34.99, 'aroma diffuser'],
    ['Essential Oil Starter Kit (6 Pack)', 'Therapeutic grade lavender, eucalyptus, peppermint, lemon, tea tree and orange oils.', 24.50, 'essential oils'],
    ['Reed Diffuser Vanilla Woods', 'Long-lasting fragrance reed diffuser with natural rattan sticks. 100ml.', 18.00, 'reed diffuser'],
    ['Bluetooth Aroma Humidifier', 'Smart humidifier with Bluetooth speaker and ambient lighting.', 59.99, 'humidifier'],
    ['Ceramic Oil Burner', 'Handcrafted ceramic tealight oil burner. Minimalist design.', 12.99, 'oil burner'],
  ],
  'bathroom': [
    ['Rainfall Shower Head Chrome', '8-inch stainless steel rainfall showerhead with anti-clog nozzles.', 39.99, 'shower head'],
    ['Bamboo Bath Mat', 'Non-slip eco-friendly bamboo bath mat with water drainage.', 22.00, 'bath mat'],
    ['Digital Bathroom Scale', 'Smart scale with body fat, BMI and 13 metrics via app.', 45.00, 'bathroom scale'],
    ['Toothbrush Sterilizer UV', 'UV-C toothbrush holder kills 99.9% germs. Wall-mounted.', 29.99, 'toothbrush sterilizer'],
    ['Luxury Cotton Towel Set (6)', '600 GSM Egyptian cotton. Includes 2 bath, 2 hand, 2 face towels.', 54.99, 'towel set'],
  ],
  'camping': [
    ['4-Person Dome Tent Waterproof', 'Easy-setup dome tent with rainfly. 5000mm waterproof rating.', 89.99, 'camping tent'],
    ['Sleeping Bag -10°C', 'Mummy-style sleeping bag rated to 14°F. Compression sack included.', 64.00, 'sleeping bag'],
    ['Portable Camping Stove', 'Compact butane stove with auto-ignition. Includes carrying case.', 32.50, 'camping stove'],
    ['LED Rechargeable Lantern', '800-lumen USB lantern with power bank function. Runs 50 hours.', 27.99, 'camping lantern'],
    ['Inflatable Sleeping Pad', 'Self-inflating pad with built-in pillow. Packs to the size of a water bottle.', 39.99, 'sleeping pad'],
  ],
  'car-accessories': [
    ['Dash Cam 4K Ultra HD', 'Front + rear dual dash cam with Wi-Fi, GPS and night vision.', 119.00, 'dash cam'],
    ['Car Phone Mount Magnetic', 'Strong neodymium magnet mount for vent or dashboard.', 14.99, 'car phone mount'],
    ['Leather Steering Wheel Cover', 'Genuine leather 15" wheel cover with anti-slip grip.', 21.00, 'steering wheel cover'],
    ['Car Vacuum Cleaner 12V', 'Portable cordless vacuum with HEPA filter and LED light.', 38.50, 'car vacuum'],
    ['Tire Pressure Monitor', 'Wireless TPMS with 4 sensors and solar-powered display.', 49.99, 'tire pressure'],
  ],
  'childrens-goods': [
    ['Wooden Building Blocks 100pc', 'Non-toxic wooden blocks in 6 colors. Ages 3+.', 29.99, 'wooden blocks'],
    ['Kids Scooter with LED Wheels', '3-wheel scooter with adjustable handlebar. Ages 4-10.', 54.00, 'kids scooter'],
    ['Educational Tablet for Kids', 'Learning tablet with 100+ games. Parental controls included.', 69.99, 'kids tablet'],
    ['Plush Teddy Bear 40cm', 'Super soft teddy bear with embroidered eyes. Machine washable.', 19.99, 'teddy bear'],
    ['Kids Art Easel Double-Sided', 'Chalkboard + whiteboard easel with paper roll and storage.', 72.00, 'kids easel'],
  ],
  'christmas': [
    ['Pre-Lit Christmas Tree 6ft', 'Artificial fir with 400 warm white LED lights. PE/PVC mix.', 129.99, 'christmas tree'],
    ['Christmas Ornament Set (30)', 'Assorted shatterproof ornaments in red, gold and silver.', 24.99, 'christmas ornaments'],
    ['LED String Lights 20m', 'Outdoor-rated fairy lights with 8 modes and remote.', 18.50, 'christmas lights'],
    ['Knit Christmas Stocking Set', 'Set of 4 personalized-ready knit stockings.', 32.00, 'christmas stocking'],
    ['Advent Calendar Wooden', 'Reusable 24-drawer wooden advent calendar.', 45.99, 'advent calendar'],
  ],
  'cosmetics': [
    ['Vitamin C Serum 30ml', '20% Vitamin C + Hyaluronic Acid brightening serum.', 22.99, 'vitamin c serum'],
    ['Matte Liquid Lipstick Set (12)', 'Long-wear matte lipstick palette in nude & bold shades.', 28.00, 'liquid lipstick'],
    ['Jade Roller & Gua Sha', 'Authentic rose quartz face roller and gua sha set.', 15.99, 'jade roller'],
    ['Retinol Night Cream', 'Anti-aging retinol 2.5% moisturizer with peptides. 50ml.', 34.50, 'retinol cream'],
    ['Eyeshadow Palette 35 Colors', 'Highly pigmented matte + shimmer palette.', 26.99, 'eyeshadow palette'],
  ],
  'fitness': [
    ['Adjustable Dumbbell Set 50lbs', 'Quick-dial adjustable dumbbells, 5-50 lbs per hand.', 249.00, 'dumbbells'],
    ['Yoga Mat 6mm Non-Slip', 'Eco-friendly TPE yoga mat with alignment lines.', 29.99, 'yoga mat'],
    ['Resistance Bands Set (5)', 'Latex loop bands 10-50 lbs with door anchor.', 19.99, 'resistance bands'],
    ['Smart Jump Rope Digital', 'Counts jumps, calories and tracks via app.', 24.50, 'jump rope'],
    ['Foam Roller 18 inch', 'High-density EVA foam roller for muscle recovery.', 22.99, 'foam roller'],
  ],
  'garden': [
    ['Garden Tool Set 10 Piece', 'Stainless steel tools with ergonomic handles and tote.', 49.99, 'garden tools'],
    ['Solar Garden Stake Lights (8)', 'Color-changing solar path lights. IP65 waterproof.', 27.99, 'garden lights'],
    ['Expandable Garden Hose 100ft', 'Triple-layer latex hose with 10-function nozzle.', 34.50, 'garden hose'],
    ['Raised Garden Bed 4x4', 'Cedar raised planter for vegetables and herbs.', 89.00, 'raised garden bed'],
    ['Electric Hedge Trimmer', 'Cordless 20V hedge trimmer with 22" blade.', 79.99, 'hedge trimmer'],
  ],
  'health': [
    ['Digital Blood Pressure Monitor', 'Upper-arm BP monitor with Bluetooth and memory for 2 users.', 45.99, 'blood pressure monitor'],
    ['Pulse Oximeter Finger', 'Fingertip SpO2 and heart rate monitor with OLED display.', 18.50, 'pulse oximeter'],
    ['Multivitamin Gummies (60)', 'Adult multivitamin with B12, D3, biotin and zinc.', 14.99, 'multivitamin'],
    ['TENS Unit Muscle Stimulator', '24-mode electric muscle pulse massager with 8 pads.', 39.00, 'tens unit'],
    ['Infrared Thermometer', 'Non-contact forehead thermometer with fever alarm.', 22.99, 'thermometer'],
  ],
  'home-craftsman': [
    ['Cordless Drill Set 20V', '20V Li-ion drill with 2 batteries and 42-piece bit set.', 89.99, 'power drill'],
    ['Laser Distance Measurer', 'Digital laser tape measure, up to 165 ft. Bluetooth.', 54.00, 'laser measure'],
    ['Tool Box 22-inch Steel', 'Lockable steel toolbox with removable tray.', 42.50, 'tool box'],
    ['Cordless Heat Gun', '1500W variable temp heat gun with accessories.', 49.99, 'heat gun'],
    ['Stud Finder Digital', 'Multi-scanner detects studs, wires, metal and pipes.', 32.99, 'stud finder'],
  ],
  'kitchen': [
    ['Non-Stick Cookware Set 12pc', 'PFOA-free granite coated pots and pans with glass lids.', 119.00, 'cookware set'],
    ['Air Fryer 5.8 Qt', 'Digital air fryer with 8 presets and shake reminder.', 89.99, 'air fryer'],
    ['Chef Knife 8 inch', 'High-carbon German steel chef knife with pakkawood handle.', 39.99, 'chef knife'],
    ['Espresso Machine 15 Bar', 'Semi-automatic espresso maker with milk frother.', 159.00, 'espresso machine'],
    ['Cutting Board Set Bamboo', 'Set of 3 organic bamboo boards with juice grooves.', 24.50, 'cutting board'],
  ],
  'pets': [
    ['Automatic Pet Feeder Wi-Fi', 'Smart feeder with 6L hopper, app control and timer.', 79.99, 'pet feeder'],
    ['Cat Tree Tower Multi-Level', '5-tier cat tree with scratching posts and cozy condo.', 94.50, 'cat tree'],
    ['Orthopedic Dog Bed Large', 'Memory foam dog bed with waterproof liner, 36x27".', 64.00, 'dog bed'],
    ['Interactive Laser Cat Toy', 'Auto-rotating laser toy with 3 speeds and auto-off.', 22.99, 'cat toy'],
    ['Retractable Dog Leash 16ft', 'Tangle-free leash with anti-slip grip, for dogs up to 110 lbs.', 18.99, 'dog leash'],
  ],
  'shaving-and-haircut': [
    ['Electric Shaver Wet/Dry', 'Rechargeable foil shaver with pop-up trimmer.', 69.99, 'electric shaver'],
    ['Professional Hair Clipper Set', 'Cordless clipper with 8 guide combs and USB charging.', 49.00, 'hair clipper'],
    ['Safety Razor Double Edge', 'Classic chrome-plated safety razor with 10 blades.', 28.99, 'safety razor'],
    ['Beard Trimmer Precision', 'Waterproof beard trimmer with 20 length settings.', 39.50, 'beard trimmer'],
    ['Shaving Soap Bowl Kit', 'Badger brush, ceramic bowl and luxury shaving soap.', 34.99, 'shaving kit'],
  ],
  'solar-lighting': [
    ['Solar Flood Light 100W', 'Motion-sensor outdoor solar flood light, IP67 waterproof.', 44.99, 'solar flood light'],
    ['Solar String Lights 50ft', 'Outdoor globe string lights, 8 lighting modes.', 29.50, 'solar string lights'],
    ['Solar Pathway Lights (12)', 'Stainless steel solar garden stake lights.', 39.99, 'solar pathway'],
    ['Solar Wall Lantern Pair', 'Vintage-style solar wall sconce set of 2.', 54.00, 'solar lantern'],
    ['Solar Step Lights (6 Pack)', 'Warm white LED solar deck lights with adhesive.', 22.99, 'solar step light'],
  ],
  'sports': [
    ['Soccer Ball Size 5 Pro', 'Match-quality soccer ball, hand-stitched, FIFA standard.', 32.99, 'soccer ball'],
    ['Basketball Indoor/Outdoor', 'Composite leather basketball, official size 7.', 27.50, 'basketball'],
    ['Tennis Racket Adult', 'Graphite tennis racket with cover bag, head-light balance.', 69.99, 'tennis racket'],
    ['Badminton Set 4 Player', 'Portable badminton net, 4 rackets and 3 shuttlecocks.', 44.00, 'badminton set'],
    ['Bike Helmet Adjustable', 'Lightweight cycling helmet with LED taillight.', 39.99, 'bike helmet'],
  ],
  'video-surveillance': [
    ['4K Security Camera Outdoor', '4K PoE bullet camera with color night vision and AI detection.', 99.00, 'security camera'],
    ['Wireless Doorbell Camera', '1080p video doorbell with 2-way audio and chime.', 79.99, 'doorbell camera'],
    ['8-Channel NVR System', '4K NVR with 4 IP cameras and 2TB HDD pre-installed.', 349.00, 'nvr system'],
    ['Indoor Pan-Tilt Camera', '360° indoor camera with motion tracking and baby cry detection.', 45.99, 'indoor camera'],
    ['Solar Wireless Security Cam', 'Battery + solar powered 2K camera, no wiring needed.', 119.99, 'solar camera'],
  ],
};

async function main() {
  console.log('Fetching categories...');
  const { data: cats, error: catErr } = await supabase
    .from('categories').select('id, slug');
  if (catErr) { console.error(catErr); process.exit(1); }

  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const rows = [];
  for (const [slug, items] of Object.entries(PRODUCTS)) {
    const category_id = bySlug[slug];
    if (!category_id) {
      console.warn(`Skipping '${slug}' — category not found in DB.`);
      continue;
    }
    for (const [name, description, basePrice] of items) {
      const p = price(basePrice * 0.85, basePrice * 1.15);
      rows.push({
        name,
        slug: slugify(name),
        description,
        price: p,
        old_price: maybeOld(p),
        stock: rand(10, 500),
        category_id,
        image: img(slug, name),
        badge: pickBadge(),
      });
    }
  }

  console.log(`Upserting ${rows.length} products...`);
  const { data, error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, name');

  if (error) { console.error('\nFailed:', error.message); process.exit(1); }
  console.log(`Success: ${data.length} products upserted.`);
}

main();
