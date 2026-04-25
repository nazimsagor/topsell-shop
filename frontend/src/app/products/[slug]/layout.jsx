import { supabaseServer } from '@/lib/supabaseServer';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const fallback = {
    title: 'Product',
    description: 'Discover this product on TopSell — Bangladesh\'s trusted online shop.',
    alternates: { canonical: `/products/${slug}` },
  };

  if (!supabaseServer) return fallback;

  const { data: product, error } = await supabaseServer
    .from('products')
    .select('name, description, image_url, images, price, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !product) return fallback;

  // `images` is the canonical multi-image column (array of urls). Fall back
  // to the legacy single `image_url` if `images` is missing/empty.
  const firstImage =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image_url ||
    '/icon.svg';

  const description =
    (product.description && String(product.description).slice(0, 160)) ||
    `Buy ${product.name} on TopSell — fast delivery and Cash on Delivery across Bangladesh.`;

  const url = `/products/${product.slug || slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${product.name} | TopSell`,
      description,
      images: [
        {
          url: firstImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | TopSell`,
      description,
      images: [firstImage],
    },
  };
}

export default function Layout({ children }) {
  return children;
}
