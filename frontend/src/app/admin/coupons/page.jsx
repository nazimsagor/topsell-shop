'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Pencil, Trash2, X, Percent, DollarSign, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';
import { couponsApi } from '@/lib/api';

const STATUS_PILL = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  expired:  'bg-red-100 text-red-700',
  used_up:  'bg-yellow-100 text-yellow-700',
};

function deriveStatus(c) {
  if (!c.is_active) return 'inactive';
  if (c.expires_at && new Date(c.expires_at) < new Date()) return 'expired';
  if (c.max_uses != null && (c.used_count ?? 0) >= c.max_uses) return 'used_up';
  return 'active';
}

function humanize(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDiscount(c) {
  const v = Number(c.discount_value);
  return c.discount_type === 'percent' ? `${v}%` : `৳${v.toFixed(0)}`;
}

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// YYYY-MM-DDTHH:MM for <input type="datetime-local">
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCouponsPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const [coupons, setCoupons] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState(null); // null | {} (new) | coupon object (edit)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  const fetchCoupons = () => {
    setFetching(true);
    couponsApi.getAll()
      .then((res) => setCoupons(res.data || []))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchCoupons();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, search]);

  const handleDelete = async (c) => {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return;
    try {
      await couponsApi.delete(c.id);
      toast.success('Coupon deleted');
      setCoupons((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const inputCls =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-red-600" /> Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} total</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-lg"
        >
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code..."
            className={`${inputCls} pl-9 w-full`}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    {search ? 'No coupons match your search.' : 'No coupons yet. Click "New Coupon" to create one.'}
                  </td>
                </tr>
              ) : filtered.map((c) => {
                const status = deriveStatus(c);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-bold text-red-600">{c.code}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                        {c.discount_type === 'percent'
                          ? <><Percent className="h-3.5 w-3.5" /> {Number(c.discount_value)}%</>
                          : <><DollarSign className="h-3.5 w-3.5" /> {Number(c.discount_value).toFixed(0)}</>
                        }
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {Number(c.min_order_amount) > 0 ? `৳${Number(c.min_order_amount).toFixed(0)}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.used_count ?? 0}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDate(c.expires_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_PILL[status]}`}>
                        {humanize(status)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <CouponFormModal
          coupon={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, mode) => {
            setEditing(null);
            setCoupons((prev) => mode === 'create'
              ? [saved, ...prev]
              : prev.map((x) => x.id === saved.id ? saved : x));
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / edit modal
// ---------------------------------------------------------------------------
function CouponFormModal({ coupon, onClose, onSaved }) {
  const isEdit = Boolean(coupon?.id);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    code:             coupon.code || '',
    discount_type:    coupon.discount_type || 'percent',
    discount_value:   coupon.discount_value ?? '',
    min_order_amount: coupon.min_order_amount ?? '',
    max_uses:         coupon.max_uses ?? '',
    expires_at:       toLocalInput(coupon.expires_at),
    is_active:        coupon.is_active ?? true,
  }));

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (form.discount_value === '' || Number(form.discount_value) < 0)
      return toast.error('Enter a valid discount value');
    if (form.discount_type === 'percent' && Number(form.discount_value) > 100)
      return toast.error('Percentage cannot exceed 100');

    const payload = {
      code:             form.code.trim().toUpperCase(),
      discount_type:    form.discount_type,
      discount_value:   Number(form.discount_value),
      min_order_amount: form.min_order_amount === '' ? 0 : Number(form.min_order_amount),
      max_uses:         form.max_uses === '' ? null : parseInt(form.max_uses, 10),
      expires_at:       form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active:        Boolean(form.is_active),
    };

    setSaving(true);
    try {
      const { data } = isEdit
        ? await couponsApi.update(coupon.id, payload)
        : await couponsApi.create(payload);
      toast.success(isEdit ? 'Coupon updated' : 'Coupon created');
      onSaved(data, isEdit ? 'update' : 'create');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? `Edit coupon: ${coupon.code}` : 'Create new coupon'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
            <input
              value={form.code}
              onChange={(e) => setField('code', e.target.value.toUpperCase())}
              placeholder="SAVE20"
              disabled={isEdit}
              className={`${inputCls} font-mono ${isEdit ? 'bg-gray-50 text-gray-500' : ''}`}
              required
            />
            {isEdit && <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setField('discount_type', e.target.value)}
                className={inputCls}
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value * {form.discount_type === 'percent' ? '(%)' : '(৳)'}
              </label>
              <input
                type="number"
                min="0"
                step={form.discount_type === 'percent' ? '1' : '0.01'}
                max={form.discount_type === 'percent' ? 100 : undefined}
                value={form.discount_value}
                onChange={(e) => setField('discount_value', e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (৳)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.min_order_amount}
              onChange={(e) => setField('min_order_amount', e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank for no minimum.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Uses</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.max_uses}
                onChange={(e) => setField('max_uses', e.target.value)}
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setField('expires_at', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setField('is_active', e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            <span className="text-sm font-medium text-gray-900">Active</span>
            <span className="text-xs text-gray-500">
              (Inactive coupons cannot be applied to any order.)
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-60"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
