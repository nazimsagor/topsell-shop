'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const params = statusFilter ? { status: statusFilter } : {};
    ordersApi.getAll(params)
      .then(({ data }) => setOrders(data))
      .finally(() => setFetching(false));
  }, [user, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto py-2 text-sm">
          <option value="">All Status</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Date', 'Total', 'Status', 'Payment', 'Actions'].map((h) => (
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
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-semibold text-primary-600">
                    <Link href={`/account/orders/${order.id}`} className="hover:underline">{order.order_number}</Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.user_name || 'Guest'}</td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-semibold">${parseFloat(order.total).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/account/orders/${order.id}`} className="text-primary-600 hover:underline text-xs">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!fetching && orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
}
