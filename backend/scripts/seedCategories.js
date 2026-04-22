require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CATEGORY_NAMES = [
  'Car accessories',
  'Aroma diffusers',
  'Bathroom',
  'Shaving and Haircut',
  'Video surveillance',
  'Garden',
  "Children's goods",
  'Home craftsman',
  'Pets',
  'Health',
  'Cosmetics',
  'Christmas',
  'Kitchen',
  'Camping',
  'Solar lighting',
  'Fitness',
];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function main() {
  const rows = CATEGORY_NAMES.map((name) => ({ name, slug: slugify(name) }));

  console.log('Seeding categories:');
  rows.forEach((r) => console.log(`  - ${r.name.padEnd(22)} -> ${r.slug}`));

  const { data, error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('\nFailed:', error.message);
    process.exit(1);
  }

  console.log(`\nSuccess: ${data.length} categories upserted.`);
}

main();
