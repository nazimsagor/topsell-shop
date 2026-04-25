'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function AdminCustomersPage() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    usersApi.getAll({ limit: 200 })
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) =>
      !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleAdmin = async (u) => {
    const next = u.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change ${u.name}'s role to "${next}"?`)) return;
    try {
      const { data } = await usersApi.updateRole(u.id, next);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: data.role } : x)));
      toast.success(`Role updated to ${data.role}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers ({users.length})</h1>
      </div>

      <div className="card mb-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search name or email…"
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
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No customers</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    <Link href={`/admin/customers/${u.id}`} className="hover:text-red-600">
                      {u.name || '—'}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/customers/${u.id}`} className="text-xs font-semibold text-red-600 hover:underline">View</Link>
                      <button
                        onClick={() => toggleAdmin(u)}
                        disabled={me?.id === u.id}
                        title={me?.id === u.id ? "You can't change your own role" : 'Toggle admin role'}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md border border-gray-200 hover:border-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {u.role === 'admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        {u.role === 'admin' ? 'Demote' : 'Make admin'}
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
