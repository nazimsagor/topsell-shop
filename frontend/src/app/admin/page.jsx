'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Plus, Tag } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { usersApi } from '../../lib/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
};

export default function AdminDashboard() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [stats, setStats]       = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    usersApi.getDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: stats.stats.orders,                         icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Revenue',      value: `৳${stats.stats.revenue.toFixed(2)}`,       icon: DollarSign,  color: 'bg-green-500' },
    { label: 'Customers',    value: stats.stats.customers,                      icon: Users,       color: 'bg-purple-500' },
    { label: 'Products',     value: stats.stats.products,                       icon: Package,     color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 ${color} rounded-xl`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/admin/products', label: 'Manage Products', icon: Package },
          { href: '/admin/orders',   label: 'Manage Orders',   icon: ShoppingBag },
          { href: '/admin/customers',label: 'View Customers',  icon: Users },
          { href: '/admin/coupons',  label: 'Manage Coupons',  icon: Tag },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-primary-300 transition-all"
          >
            <Icon className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900 text-sm">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline font-medium">
            View All
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Customer', 'Date', 'Total', 'Status'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold text-primary-600">
                        #{order.id}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {order.user_name || order.users?.name || 'Guest'}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-semibold">
                      ${parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
