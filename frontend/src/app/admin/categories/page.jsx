'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categoriesApi } from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const blank = { name: '', slug: '', image: '', parent_id: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);   // null | 'new' | <id>
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const refresh = () =>
    categoriesApi.getAll()
      .then(({ data }) => setCategories(Array.isArray(data) ? data : data.categories || []))
      .finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []);

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      image: c.image || '',
      parent_id: c.parent_id || '',
    });
  };

  const startNew = () => {
    setEditingId('new');
    setForm(blank);
  };

  const cancel = () => { setEditingId(null); setForm(blank); };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || slugify(form.name)).trim(),
        image: form.image || null,
        parent_id: form.parent_id || null,
      };
      if (editingId === 'new') {
        await categoriesApi.create(payload);
        toast.success('Category created');
      } else {
        await categoriesApi.update(editingId, payload);
        toast.success('Category updated');
      }
      cancel();
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try {
      await categoriesApi.delete(c.id);
      toast.success('Category deleted');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories ({categories.length})</h1>
        {editingId !== 'new' && (
          <button onClick={startNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {/* New / edit form */}
      {editingId !== null && (
        <div className="card p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId === 'new' ? 'New category' : 'Edit category'}
            </h2>
            <button onClick={cancel} className="text-gray-500 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
                className="input"
                placeholder="e.g. Electronics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input"
                placeholder="electronics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent category</label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                className="input"
              >
                <option value="">— none —</option>
                {categories.filter((c) => c.id !== editingId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image / icon URL</label>
              <input
                value={form.image || ''}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Or upload image</label>
            <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancel} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Image', 'Name', 'Slug', 'Products', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded" /></td></tr>
                ))
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No categories yet</td></tr>
              ) : categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-lg">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      ) : '📦'}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono">{c.slug}</td>
                  <td className="px-5 py-3 text-gray-600">{c.product_count ?? 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50">
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
