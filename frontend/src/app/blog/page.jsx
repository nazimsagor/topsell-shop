import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { supabaseServer } from '@/lib/supabaseServer';

// Server component — fetched at request time so new posts appear without
// needing a redeploy. Revalidate every 5 minutes.
export const revalidate = 300;

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

async function getPosts() {
  if (!supabaseServer) return [];
  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, image_url, published_at')
    .order('published_at', { ascending: false });
  if (error) {
    console.error('[blog] failed to load posts:', error.message);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">From the TopSell Blog</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Buying guides, product round-ups and shopping tips written for Bangladesh.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <p className="text-5xl mb-4">📝</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Check back soon — fresh articles are coming.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl">📝</div>
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      <Tag className="h-3 w-3" /> {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.published_at)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
