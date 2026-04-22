'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, Truck, Check } from 'lucide-react';
import useAuthStore from '../../../../store/useAuthStore';
import { ordersApi } from '../../../../lib/api';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    ordersApi.getOne(id)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  }, [id, user, router]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  if (!order) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Order not found</h2>
      <Link href="/account/orders" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl">Back to Orders</Link>
    </div>
  );

  const items = order.order_items || order.items || [];
  const currentStep = STATUS_STEPS.indexOf(order.status);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number || order.id}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Progress tracker */}
      {!['cancelled', 'refunded'].includes(order.status) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Progress</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-red-600 z-0 transition-all"
              style={{ width: currentStep === -1 ? '0' : `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  i <= currentStep ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {i < currentStep ? <Check className="h-4 w-4" /> : i === 0 ? <Package className="h-3.5 w-3.5" /> : i === 3 ? <Truck className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className="text-xs text-center text-gray-600 capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <p className="text-xs text-gray-500">Qty: {qty} × ${price.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-sm">${(price * qty).toFixed(2)}</p>
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
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `$${shippingCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
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

          {order.tracking_number && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Tracking</h2>
              <p className="text-sm font-mono text-red-600">{order.tracking_number}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
