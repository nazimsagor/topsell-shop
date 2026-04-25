'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { blogApi } from '@/lib/api';

const BLANK = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  image_url: '',
  published_at: '',
};

const CATEGORIES = ['Kitchen', 'Fitness', 'Electronics', 'Home', 'Beauty', 'Tech', 'Lifestyle'];

// Auto-derive a slug from a title.
function slugify(s = '') {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function BlogForm({ mode, postId }) {
  const router = useRouter();
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  // True until the user manually edits the slug field — until then we
  // keep auto-syncing from the title.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');

  useEffect(() => {
    if (mode !== 'edit' || !postId) return;
    blogApi.getOne(postId)
      .then(({ data }) => {
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          category: data.category || '',
          image_url: data.image_url || '',
          // Format for <input type="datetime-local">
          published_at: data.published_at
            ? new Date(data.published_at).toISOString().slice(0, 16)
            : '',
        });
      })
      .catch(() => toast.error('Failed to load post'))
      .finally(() => setLoading(false));
  }, [mode, postId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onTitleChange = (v) => {
    set('title', v);
    if (!slugManuallyEdited) set('slug', slugify(v));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim())   return toast.error('Title is required');
    if (!form.content.trim()) return toast.error('Content is required');

    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : new Date().toISOString(),
    };
    try {
      if (mode === 'edit') {
        await blogApi.update(postId, payload);
        toast.success('Post updated');
      } else {
        await blogApi.create(payload);
        toast.success('Post created');
      }
      router.push('/admin/blog');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === 'edit' ? 'Edit Post' : 'New Blog Post'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="card p-5 sm:p-6 space-y-4">
          <Field label="Title" required>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Top 10 Kitchen Gadgets You Need in 2026"
              className="input"
            />
          </Field>

          <Field
            label="Slug"
            required
            hint="Lowercase letters, numbers and hyphens only. Used in the URL: /blog/your-slug"
          >
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => { setSlugManuallyEdited(true); set('slug', e.target.value); }}
              placeholder="top-10-kitchen-gadgets"
              className="input font-mono"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <input
                list="blog-categories"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Kitchen"
                className="input"
              />
              <datalist id="blog-categories">
                {CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>

            <Field label="Published at">
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => set('published_at', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Image URL" hint="Cover image shown on the listing and post page.">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input"
            />
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image_url}
                alt="Cover preview"
                className="mt-3 w-full max-h-56 object-cover rounded-lg border border-gray-200"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </Field>

          <Field label="Excerpt" hint="Short summary shown on the listing page (1–2 sentences).">
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="Discover the must-have kitchen tools that will transform your cooking experience."
              className="input resize-none"
            />
          </Field>

          <Field label="Content" required hint="Plain text. Blank lines start new paragraphs.">
            <textarea
              required
              rows={14}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder="Write the full blog post content here…"
              className="input resize-y font-mono text-sm"
            />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 disabled:opacity-60"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              : <><Save className="h-4 w-4" /> {mode === 'edit' ? 'Save Changes' : 'Publish Post'}</>}
          </button>
          <Link
            href="/admin/blog"
            className="text-sm font-semibold text-gray-600 hover:text-red-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}
