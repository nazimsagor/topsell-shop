'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bannersApi } from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';

const blank = {
  title: '',
  subtitle: '',
  image: '',
  link_url: '',
  cta_label: '',
  position: 0,
  is_active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const refresh = () =>
    bannersApi.getAll()
      .then(({ data }) => setBanners(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []);

  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      image: b.image || '',
      link_url: b.link_url || '',
      cta_label: b.cta_label || '',
      position: b.position ?? 0,
      is_active: b.is_active ?? true,
    });
  };

  const startNew = () => { setEditingId('new'); setForm(blank); };
  const cancel = () => { setEditingId(null); setForm(blank); };

  const save = async () => {
    if (!form.image) return toast.error('Banner image is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        position: parseInt(form.position) || 0,
      };
      if (editingId === 'new') {
        await bannersApi.create(payload);
        toast.success('Banner created');
      } else {
        await bannersApi.update(editingId, payload);
        toast.success('Banner updated');
      }
      cancel();
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await bannersApi.delete(b.id);
      toast.success('Banner deleted');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const toggleActive = async (b) => {
    try {
      const { data } = await bannersApi.update(b.id, { is_active: !b.is_active });
      setBanners((prev) => prev.map((x) => (x.id === b.id ? data : x)));
    } catch {
      toast.error('Failed to toggle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hero Banners ({banners.length})</h1>
        {editingId !== 'new' && (
          <button onClick={startNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        )}
      </div>

      {/* Form */}
      {editingId !== null && (
        <div className="card p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId === 'new' ? 'New banner' : 'Edit banner'}
            </h2>
            <button onClick={cancel} className="text-gray-500 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Big Sale!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" placeholder="Up to 50% off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA label</label>
              <input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className="input" placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className="input" placeholder="/products?badge=SALE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="text-red-600 h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
            <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save banner'}
            </button>
            <button onClick={cancel} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading…</p>
        ) : banners.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No banners yet — add one to get started</p>
        ) : banners.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
              <div className="aspect-[16/9] sm:aspect-auto sm:h-40 bg-gray-100 overflow-hidden">
                {b.image ? <img src={b.image} alt={b.title || ''} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="sm:col-span-2 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{b.title || '(untitled)'}</h3>
                    <span className={`badge ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {b.subtitle && <p className="text-sm text-gray-600 mt-1">{b.subtitle}</p>}
                  {b.link_url && <p className="text-xs text-gray-400 mt-2 font-mono truncate">{b.link_url}</p>}
                  <p className="text-xs text-gray-400 mt-1">Position: {b.position ?? 0}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => startEdit(b)} className="inline-flex items-center gap-1 text-xs font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:border-red-400 hover:text-red-600">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => toggleActive(b)} className="inline-flex items-center gap-1 text-xs font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:border-red-400 hover:text-red-600">
                    {b.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                  </button>
                  <button onClick={() => remove(b)} className="inline-flex items-center gap-1 text-xs font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:border-red-500 hover:text-red-600 text-red-600">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
