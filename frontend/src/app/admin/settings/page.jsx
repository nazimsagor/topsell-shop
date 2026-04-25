'use client';
import { useEffect, useState } from 'react';
import { Save, Store, Phone, Mail, MapPin, Share2, Truck, Percent } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { settingsApi } from '@/lib/api';

const FIELDS = [
  { key: 'store_name',         label: 'Store name',        icon: Store, type: 'text' },
  { key: 'store_email',        label: 'Contact email',     icon: Mail, type: 'email' },
  { key: 'store_phone',        label: 'Contact phone',     icon: Phone, type: 'tel' },
  { key: 'store_address',      label: 'Store address',     icon: MapPin, type: 'text' },
  { key: 'social_facebook',    label: 'Facebook URL',      icon: Share2, type: 'url' },
  { key: 'social_instagram',   label: 'Instagram URL',     icon: Share2, type: 'url' },
  { key: 'social_youtube',     label: 'YouTube URL',       icon: Share2, type: 'url' },
  { key: 'free_ship_threshold',label: 'Free shipping over (৳)', icon: Truck, type: 'number' },
  { key: 'tax_rate',           label: 'Tax rate (%)',      icon: Percent, type: 'number' },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then(({ data }) => {
        const v = {};
        for (const k in data) v[k] = data[k] ?? '';
        setValues(v);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Coerce numeric fields to numbers, leave the rest as JSON-safe strings.
      const payload = {};
      for (const f of FIELDS) {
        const raw = values[f.key];
        if (raw === undefined) continue;
        payload[f.key] = f.type === 'number' ? Number(raw) || 0 : String(raw);
      }
      await settingsApi.update(payload);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>

      <form onSubmit={onSave} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Store</h2>
          {FIELDS.slice(0, 4).map((f) => <Field key={f.key} f={f} values={values} setValues={setValues} />)}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Social media</h2>
          {FIELDS.slice(4, 7).map((f) => <Field key={f.key} f={f} values={values} setValues={setValues} />)}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          {FIELDS.slice(7).map((f) => <Field key={f.key} f={f} values={values} setValues={setValues} />)}
        </div>

        <div>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ f, values, setValues }) {
  const Icon = f.icon;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gray-400" /> {f.label}
        </span>
      </label>
      <input
        type={f.type}
        value={values[f.key] ?? ''}
        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
        className="input"
      />
    </div>
  );
}
