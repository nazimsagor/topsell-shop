import { supabaseServer } from '@/lib/supabaseServer';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const fallback = {
    title: 'Blog Post',
    description: 'Read the latest from the TopSell blog.',
    alternates: { canonical: `/blog/${slug}` },
  };

  if (!supabaseServer) return fallback;

  const { data: post, error } = await supabaseServer
    .from('blog_posts')
    .select('title, excerpt, image_url, slug, published_at, category')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !post) return fallback;

  const description =
    (post.excerpt && String(post.excerpt).slice(0, 160)) ||
    `Read "${post.title}" on the TopSell blog.`;
  const url = `/blog/${post.slug || slug}`;
  const image = post.image_url || '/icon.svg';

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: `${post.title} | TopSell`,
      description,
      publishedTime: post.published_at || undefined,
      section: post.category || undefined,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | TopSell`,
      description,
      images: [image],
    },
  };
}

export default function Layout({ children }) {
  return children;
}
