import { supabaseServer } from '@/lib/supabaseServer';

const SITE_URL = 'https://topsell-shop-227t.vercel.app';

const STATIC_ROUTES = [
  { path: '',          changeFrequency: 'daily',   priority: 1.0 },
  { path: '/products', changeFrequency: 'daily',   priority: 0.9 },
  { path: '/contact',  changeFrequency: 'yearly',  priority: 0.5 },
  { path: '/help',     changeFrequency: 'monthly', priority: 0.4 },
  { path: '/shipping', changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/returns',  changeFrequency: 'yearly',  priority: 0.3 },
];

export default async function sitemap() {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let productEntries = [];
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select('slug, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5000);

      if (!error && Array.isArray(data)) {
        productEntries = data
          .filter((p) => p.slug)
          .map((p) => ({
            url: `${SITE_URL}/products/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : now,
            changeFrequency: 'weekly',
            priority: 0.8,
          }));
      }
    } catch {
      // If Supabase is unreachable at build time, ship a sitemap with just
      // static routes rather than failing the build.
    }
  }

  return [...staticEntries, ...productEntries];
}
