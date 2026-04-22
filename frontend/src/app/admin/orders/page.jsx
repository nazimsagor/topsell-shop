'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

const PAGE_SIZE = 15;

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
};

const PAY_STATUS_COLORS = {
  paid:     'bg-green-100 text-green-700',
  unpaid:   'bg-yellow-100 text-yellow-700',
  refunded: 'bg-gray-100 text-gray-600',
};

// Derive a payment status since the orders table has no explicit column.
//  - cancelled / refunded → refunded
//  - delivered or non-COD paid → paid
//  - otherwise → unpaid
function derivePaymentStatus(o) {
  if (['refunded', 'cancelled'].includes(o.status)) return 'refunded';
  if (o.status === 'delivered') return 'paid';
  if (o.payment_method && o.payment_method !== 'cash_on_delivery' && o.status !== 'pending') {
    return 'paid';
  }
  return 'unpaid';
}

const humanize = (s) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

export default function AdminOrdersPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [totalServer, setTotalServer] = useState(0);
  const [fetching, setFetching] = useState(true);

  const [statusFilter, setStatusFilter]   = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch]               = useState('');
  const [sort, setSort]                   = useState({ by: 'created_at', dir: 'desc' });
  const [page, setPage]                   = useState(1);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  // Reset page on filter/search changes
  useEffect(() => { setPage(1); }, [statusFilter, paymentFilter, search, sort.by, sort.dir]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setFetching(true);
    const params = {
      page,
      limit: PAGE_SIZE,
      sort_by: sort.by,
      sort_dir: sort.dir,
    };
    if (statusFilter) params.status = statusFilter;
    if (search && /^\d+$/.test(search.trim())) params.search = search.trim();

    ordersApi.getAll(params)
      .then((res) => {
        setOrders(res.data || []);
        const total = parseInt(res.headers?.['x-total-count']);
        setTotalServer(Number.isFinite(total) ? total : (res.data || []).length);
      })
      .finally(() => setFetching(false));
  }, [user, page, statusFilter, sort.by, sort.dir, search]);

  // Client-side filters: payment status + name/email text search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(q);
    return orders.filter((o) => {
      const payStatus = derivePaymentStatus(o);
      if (paymentFilter && payStatus !== paymentFilter) return false;
      if (q && !isNumeric) {
        const hay = [
          o.users?.name,
          o.users?.email,
          o.user_name,
          o.user_email,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, paymentFilter, search]);

  const totalPages = Math.max(1, Math.ceil(totalServer / PAGE_SIZE));

  const toggleSort = (by) => setSort((s) => (s.by === by ? { by, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { by, dir: 'desc' }));

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalServer} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or customer name..."
            className={`${inputCls} pl-9 w-full`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputCls} w-full`}
        >
          <option value="">All Order Status</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{humanize(s)}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className={`${inputCls} w-full`}
        >
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <button onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-gray-700">
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <button onClick={() => toggleSort('total')} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-gray-700">
                    Total <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : filtered.map((order) => {
                const customerName = order.users?.name || order.user_name || order.users?.email || 'Guest';
                const orderRef = order.order_number || (order.id ? `${order.id}` : '');
                const itemCount = order.order_items?.length ?? order.items?.length ?? 0;
                const payStatus = derivePaymentStatus(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-semibold text-red-600">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">#{orderRef}</Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{customerName}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{itemCount}</td>
                    <td className="px-5 py-3 font-semibold">${parseFloat(order.total).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${PAY_STATUS_COLORS[payStatus]}`}>
                        {humanize(payStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {humanize(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-red-600 hover:underline text-xs font-semibold">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!fetching && totalServer > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
            <p className="text-gray-500">
              Page {page} of {totalPages} · {totalServer} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
