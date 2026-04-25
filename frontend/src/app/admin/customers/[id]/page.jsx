'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Mail, Shield, ShieldCheck, Calendar, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const { user: me } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getOne(id)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleRole = async () => {
    if (!data) return;
    const next = data.user.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change role to "${next}"?`)) return;
    try {
      const { data: updated } = await usersApi.updateRole(data.user.id, next);
      setData((d) => ({ ...d, user: { ...d.user, role: updated.role } }));
      toast.success(`Role updated to ${updated.role}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }
  if (!data) return null;

  const { user, orders, totalSpent } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name || '—'}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" /> Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`badge ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
              {user.role}
            </span>
          </div>
          <button
            onClick={toggleRole}
            disabled={me?.id === user.id}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:border-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
            title={me?.id === user.id ? "You can't change your own role" : 'Toggle admin role'}
          >
            {user.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            {user.role === 'admin' ? 'Demote to customer' : 'Promote to admin'}
          </button>
        </div>

        <div className="card p-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Lifetime spend</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">৳{Math.round(totalSpent).toLocaleString('en-BD')}</p>
          <p className="text-xs text-gray-500 mt-1">{orders.length} order{orders.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-red-600" />
          <h2 className="font-bold text-gray-900">Order history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Date', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No orders yet</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-semibold text-red-600">{o.order_number}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-semibold">৳{parseFloat(o.total).toFixed(0)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs font-semibold text-red-600 hover:underline">View</Link>
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
