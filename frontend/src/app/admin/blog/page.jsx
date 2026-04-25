'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { blogApi } from '@/lib/api';

export default function AdminBlogPage() {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    blogApi.list()
      .then(({ data }) => setPosts(Array.isArray(data?.posts) ? data.posts : []))
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.slug || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [posts, search]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete post "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await blogApi.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-red-600" /> Blog Posts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {posts.length} post{posts.length === 1 ? '' : 's'}
            {search && ` · ${filtered.length} matching`}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 btn-primary text-sm py-2 px-4"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      <div className="card mb-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by title, slug or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Post', 'Category', 'Published', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                  {posts.length === 0 ? 'No posts yet — click “New Post” to publish your first one.' : 'No matches'}
                </td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">📝</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {p.category ? (
                      <span className="inline-flex items-center bg-red-50 text-red-700 text-xs font-semibold px-2 py-1 rounded-md">
                        {p.category}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on site"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/edit/${p.id}`}
                        title="Edit"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        title="Delete"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
