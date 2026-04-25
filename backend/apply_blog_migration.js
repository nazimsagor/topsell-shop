// Seed/verify the blog_posts table.
// PREREQUISITE: run backend/src/db/migrations/20260428_blog_posts.sql
// once in the Supabase SQL editor — supabase-js cannot run DDL. After the
// table exists, this script idempotently upserts the 3 seed posts.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const POSTS = [
  {
    title:   'Top 10 Kitchen Gadgets You Need in 2026',
    slug:    'top-10-kitchen-gadgets',
    excerpt: 'Discover the must-have kitchen tools that will transform your cooking experience.',
    category:'Kitchen',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    published_at: '2026-04-15T10:00:00Z',
    content:
`The kitchen is the heart of every home, and the right tools can make all the difference. In 2026, smart kitchen gadgets are no longer a luxury — they are the new normal.

1. Smart Air Fryer — fries, bakes and roasts with 80 percent less oil.
2. Digital Kitchen Scale — pinpoint accuracy for baking and meal prep.
3. Multi-function Pressure Cooker — slow cook, pressure cook, sauté, and steam in one pot.
4. Cordless Hand Blender — perfect for soups, smoothies and sauces on the go.
5. Electric Spice Grinder — fresh-ground spices in seconds.
6. Smart Coffee Maker — brew the perfect cup from your phone.
7. Vacuum Food Sealer — keep ingredients fresh up to 5x longer.
8. Vegetable Spiralizer — turn veggies into noodles for healthy meals.
9. Induction Cooktop — fast, energy-efficient and safer than gas.
10. Smart Oven with Air Fry — bake, broil, toast and air-fry in one appliance.

These gadgets are not just trendy — they save time, reduce waste, and make cooking enjoyable for every home cook in Bangladesh.`,
  },
  {
    title:   'Best Fitness Equipment for Home Workouts',
    slug:    'best-fitness-equipment',
    excerpt: 'Build your perfect home gym with these essential fitness tools. Stay fit without leaving your house.',
    category:'Fitness',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
    published_at: '2026-04-10T10:00:00Z',
    content:
`You don't need an expensive gym membership to stay in shape. With the right gear, your living room becomes a full-service fitness studio.

Essentials for any home gym:

- Adjustable Dumbbells — replace an entire rack with a single space-saving pair.
- Resistance Bands — build strength and flexibility with light, portable bands.
- Yoga Mat — a non-slip mat is the foundation of every floor workout.
- Pull-up Bar — door-frame mounts add upper-body strength training without drilling.
- Jump Rope — burn 200+ calories in just 15 minutes of skipping.
- Foam Roller — recover faster and reduce muscle soreness after workouts.
- Kettlebell — one tool for hundreds of full-body movements.
- Stability Ball — improve core strength and posture.

Start small and add equipment as your routine grows. Consistency, not equipment, is what builds results.`,
  },
  {
    title:   'How to Choose the Right Security Camera',
    slug:    'choose-security-camera',
    excerpt: 'Protect your home with the right security camera system. Learn what features matter most.',
    category:'Electronics',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    published_at: '2026-04-05T10:00:00Z',
    content:
`A modern security camera does more than record video — it gives you peace of mind. Here is what to look for when buying one in 2026.

Key features to compare:

1. Resolution — 1080p is the minimum; 2K and 4K give clearer faces and license plates.
2. Field of View — wider lenses (110°+) cover more of a room with one camera.
3. Night Vision — infrared LEDs are standard; color night vision needs ambient light.
4. Two-Way Audio — talk to delivery drivers, family members or pets remotely.
5. Smart Detection — AI distinguishes people, vehicles and packages from passing leaves.
6. Cloud vs Local Storage — cloud is convenient; SD card / NVR keeps footage private.
7. Power — wired never dies; battery cameras install anywhere; solar cameras run forever.
8. Weatherproofing — IP65 or higher for outdoor use.
9. App Quality — a smooth mobile app is what you actually use every day.
10. Privacy & Encryption — end-to-end encryption protects your feed from intruders.

Pick a camera that matches your home — entry points need wired reliability, while interior cameras can be small and battery-powered. Always change the default password and enable two-factor authentication.`,
  },
];

(async () => {
  const probe = await sb.from('blog_posts').select('slug').limit(1);
  if (probe.error && probe.error.code === 'PGRST205') {
    console.error('\n❌ blog_posts table does not exist yet.');
    console.error('   Open the Supabase SQL editor for project gvbbkzpzeejzjnnrgtaj and paste:');
    console.error('   backend/src/db/migrations/20260428_blog_posts.sql\n');
    process.exit(1);
  }
  if (probe.error) throw probe.error;

  const { data, error } = await sb
    .from('blog_posts')
    .upsert(POSTS, { onConflict: 'slug' })
    .select('slug, title');
  if (error) throw error;
  console.log('Seeded blog_posts:');
  data.forEach((r) => console.log(' -', r.slug, '|', r.title));
})().catch((e) => { console.error(e); process.exit(1); });
