'use client';
import { useEffect, useMemo, useState } from 'react';
import { Download, Search, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { newsletterApi } from '@/lib/api';

export default function AdminNewslettersPage() {
  const [subs, setSubs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    newsletterApi.list()
      .then(({ data }) => setSubs(Array.isArray(data?.subscribers) ? data.subscribers : []))
      .catch(() => toast.error('Failed to load subscribers'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter((s) => (s.email || '').toLowerCase().includes(q));
  }, [subs, search]);

  const exportCsv = () => {
    if (!subs.length) return;
    const header = 'id,email,created_at\n';
    const body = subs
      .map((s) => `${s.id},"${(s.email || '').replace(/"/g, '""')}",${s.created_at || ''}`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-6 w-6 text-red-600" /> Newsletter Subscribers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {subs.length} total{search && ` · ${filtered.length} matching`}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!subs.length}
          className="inline-flex items-center gap-2 btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="card mb-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by email…"
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
                {['#', 'Email', 'Subscribed on'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">
                  {subs.length === 0 ? 'No subscribers yet' : 'No matches'}
                </td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-gray-400">{s.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 break-all">{s.email}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
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
