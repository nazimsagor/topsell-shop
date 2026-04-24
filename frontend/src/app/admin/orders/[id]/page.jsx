'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../../../store/useAuthStore';
import { ordersApi } from '../../../../lib/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    ordersApi.getOne(id)
      .then(({ data }) => {
        setOrder(data);
        setStatus(data.status || 'pending');
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleUpdateStatus = async () => {
    if (!status || status === order.status) return;
    setSaving(true);
    try {
      const { data } = await ordersApi.updateStatus(id, { status });
      setOrder((prev) => ({ ...prev, ...data }));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  if (!order) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Order not found</h2>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl">
        Back to Orders
      </Link>
    </div>
  );

  const items = order.order_items || order.items || [];
  let addr = order.shipping_address || {};
  if (typeof addr === 'string') {
    try { addr = JSON.parse(addr); } catch { addr = {}; }
  }
  const hasAddr = addr && (addr.full_name || addr.street || addr.address || addr.city || addr.phone);

  const num = (v) => parseFloat(v || 0) || 0;
  const subtotal = order.subtotal != null
    ? num(order.subtotal)
    : items.reduce((s, i) => s + num(i.price) * (i.qty ?? i.quantity ?? 1), 0);
  const shippingCost = num(order.shipping_cost);
  const tax          = num(order.tax);
  const discount     = num(order.discount);
  const total        = num(order.total) || (subtotal + shippingCost + tax - discount);

  const customerName = order.users?.name || order.user?.name || order.user_name || 'Guest';
  const customerEmail = order.users?.email || order.user?.email || order.user_email || '';
  const orderRef = order.order_number || (order.id ? String(order.id).slice(0, 8) : '');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
          <ChevronLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg"
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{orderRef}</h1>
          <p className="text-gray-500 text-sm">
            {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' • '}
            {customerName}{customerEmail ? ` (${customerEmail})` : ''}
          </p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium self-start ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
          <p className="font-medium text-gray-900">{customerName}</p>
          {customerEmail && <p className="text-gray-600">{customerEmail}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
          <p className="text-gray-700">{addr?.phone || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Shipping To</p>
          <p className="text-gray-700">
            {[addr?.city, addr?.district || addr?.state, addr?.country].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
      </div>

      {/* Status update */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 print:hidden">
        <h2 className="font-semibold text-gray-900 mb-3">Update Status</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={saving || status === order.status}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {items.length === 0 && <p className="text-sm text-gray-500">No items found.</p>}
              {items.map((item) => {
                const p = item.products || {};
                const name = p.name || item.product_name || 'Product';
                const image = p.image || item.product_image || null;
                const qty = item.qty ?? item.quantity ?? 1;
                const price = num(item.price);
                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500">Qty: {qty} × ৳{price.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-sm">৳{(price * qty).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>৳{subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `৳${shippingCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>৳{tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total</span><span>৳{total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              {hasAddr ? (
                <>
                  {addr?.full_name && <p className="font-medium text-gray-900">{addr.full_name}</p>}
                  {addr?.phone && <p>{addr.phone}</p>}
                  {(addr?.street || addr?.address) && <p>{addr.street || addr.address}</p>}
                  {addr?.street2 && <p>{addr.street2}</p>}
                  {(addr?.city || addr?.district || addr?.state || addr?.postal_code || addr?.zip) && (
                    <p>
                      {[
                        addr?.city,
                        addr?.district || addr?.state,
                        addr?.postal_code || addr?.zip,
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {addr?.country && <p>{addr.country}</p>}
                </>
              ) : (
                <p className="text-gray-400">No shipping address on file.</p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-800 capitalize">
                  {order.payment_method === 'cash_on_delivery'
                    ? 'Cash on Delivery'
                    : order.payment_method
                      ? order.payment_method.replace(/_/g, ' ')
                      : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                  ['delivered'].includes(order.status) ? 'bg-green-100 text-green-700' :
                  ['cancelled','refunded'].includes(order.status) ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status === 'delivered' ? 'Paid' : ['cancelled','refunded'].includes(order.status) ? 'Refunded' : 'Unpaid'}
                </span>
              </div>
              {order.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="text-gray-800 font-mono text-xs">{order.transaction_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
