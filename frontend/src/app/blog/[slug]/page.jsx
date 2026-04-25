import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ChevronLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabaseServer';

// Always render on demand — never serve a cached HTML version of a post,
// so edits in /admin/blog/edit/[id] reflect on the next request.
// (No `generateStaticParams` is exported, so this stays purely dynamic.)
export const revalidate = 0;
export const dynamic = 'force-dynamic';

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

async function getPost(slug) {
  if (!supabaseServer) return null;
  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, category, image_url, published_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('[blog] failed to load post:', error.message);
    return null;
  }
  return data || null;
}

async function getRelated(currentSlug, category) {
  if (!supabaseServer) return [];
  let q = supabaseServer
    .from('blog_posts')
    .select('id, title, slug, image_url, category, published_at')
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(3);
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error || !Array.isArray(data) || data.length === 0) {
    // fall back to "any other 3 posts" if no same-category siblings exist
    const { data: any } = await supabaseServer
      .from('blog_posts')
      .select('id, title, slug, image_url, category, published_at')
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(3);
    return Array.isArray(any) ? any : [];
  }
  return data;
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelated(post.slug, post.category);

  // Normalise content into paragraphs.
  const paragraphs = String(post.content || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="bg-white">
      {/* Header / cover */}
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 mb-5"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {post.category && (
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
              <Tag className="h-3 w-3" /> {post.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="inline-flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar className="h-4 w-4" /> {formatDate(post.published_at)}
          </p>
        </div>

        {post.image_url && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {post.excerpt && (
          <p className="text-lg text-gray-700 leading-relaxed font-medium border-l-4 border-red-500 pl-4 mb-6">
            {post.excerpt}
          </p>
        )}

        <div className="space-y-4 text-gray-800 leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">More from the blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {r.image_url ? (
                      <Image
                        src={r.image_url}
                        alt={r.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">📝</div>
                    )}
                  </div>
                  <div className="p-4">
                    {r.category && (
                      <p className="text-xs font-bold text-red-600 mb-1">{r.category}</p>
                    )}
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(r.published_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
