'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  MapPin,
  CreditCard,
  Loader2,
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

// Ordered progression for the normal happy-path tracker.
const FLOW = [
  { key: 'pending',    label: 'Pending',    icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',  icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped',    label: 'Shipped',    icon: Truck },
  { key: 'delivered',  label: 'Delivered',  icon: Home },
];

const TERMINAL = {
  cancelled: { label: 'Cancelled', icon: XCircle,  description: 'This order was cancelled.' },
  refunded:  { label: 'Refunded',  icon: RotateCcw, description: 'This order has been refunded.' },
};

function formatDate(d) {
  try {
    return new Date(d).toLocaleString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function formatAddress(addr) {
  if (!addr) return null;
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.name,
    addr.phone,
    addr.line1 || addr.address,
    addr.line2,
    [addr.city, addr.state, addr.postal_code || addr.zip].filter(Boolean).join(', '),
    addr.country,
  ].filter(Boolean);
  return parts;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/auth/login?redirect=/account/orders/${id}`);
  }, [user, authLoading, router, id]);

  useEffect(() => {
    if (!user) return;
    ordersApi.getOne(id)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-4">{error || 'Order not found'}</h2>
        <Link href="/account/orders" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  const status      = (order.status || 'pending').toLowerCase();
  const isTerminal  = status === 'cancelled' || status === 'refunded';
  const currentIdx  = FLOW.findIndex((s) => s.key === status);

  const items       = order.order_items || [];
  const shipping    = formatAddress(order.shipping_address);
  const paymentName = order.payment_method === 'cod'
    ? 'Cash on Delivery'
    : order.payment_method === 'sslcommerz'
      ? 'Card / Mobile Banking (SSLCommerz)'
      : (order.payment_method || '—');

  const subtotal    = items.reduce((s, it) => s + parseFloat(it.price) * it.qty, 0);
  const total       = parseFloat(order.total) || 0;
  const shippingFee = parseFloat(order.shipping_cost || order.shipping_fee || 0);
  const tax         = parseFloat(order.tax || 0);
  const discount    = parseFloat(order.discount || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Order</p>
            <h1 className="font-mono font-extrabold text-xl sm:text-2xl text-gray-900">
              {order.order_number}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total</p>
            <p className="text-2xl font-extrabold text-gray-900">${total.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-0.5 inline-flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" /> {paymentName}
            </p>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>

        {isTerminal ? (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-5">
            {(() => {
              const T = TERMINAL[status].icon;
              return <T className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />;
            })()}
            <div>
              <p className="font-bold text-red-700">{TERMINAL[status].label}</p>
              <p className="text-sm text-red-600 mt-0.5">{TERMINAL[status].description}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop / tablet horizontal tracker */}
            <ol className="hidden sm:flex items-start justify-between relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" aria-hidden />
              <div
                className="absolute left-0 top-5 h-0.5 bg-red-500 transition-all"
                style={{
                  width: currentIdx <= 0 ? '0%' : `${(currentIdx / (FLOW.length - 1)) * 100}%`,
                }}
                aria-hidden
              />
              {FLOW.map((step, i) => {
                const Icon    = step.icon;
                const done    = i <= currentIdx;
                const current = i === currentIdx;
                return (
                  <li key={step.key} className="relative flex flex-col items-center flex-1 min-w-0 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      } ${current ? 'ring-4 ring-red-100' : ''}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className={`text-xs font-semibold mt-2 text-center ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </li>
                );
              })}
            </ol>

            {/* Mobile vertical tracker */}
            <ol className="sm:hidden space-y-0">
              {FLOW.map((step, i) => {
                const Icon    = step.icon;
                const done    = i <= currentIdx;
                const current = i === currentIdx;
                const last    = i === FLOW.length - 1;
                return (
                  <li key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                          done
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        } ${current ? 'ring-4 ring-red-100' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {!last && (
                        <div className={`w-0.5 flex-1 min-h-[32px] ${i < currentIdx ? 'bg-red-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className={`pb-6 pt-1.5 ${last ? 'pb-0' : ''}`}>
                      <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {current && (
                        <p className="text-xs text-red-600 mt-0.5">Current status</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Items ({items.length})
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">No items found for this order.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((it) => {
                  const product = it.products || {};
                  return (
                    <li key={it.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name || 'Product'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-2">{product.name || 'Product'}</p>
                        <p className="text-sm text-gray-500 mt-0.5">Qty {it.qty}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">${(parseFloat(it.price) * it.qty).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">${parseFloat(it.price).toFixed(2)} each</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
            </div>
            {shipping ? (
              Array.isArray(shipping) ? (
                <div className="text-sm text-gray-700 space-y-1 leading-relaxed">
                  {shipping.map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-semibold text-gray-900' : ''}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{shipping}</p>
              )
            ) : (
              <p className="text-sm text-gray-500">No address on file.</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Summary</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-semibold text-gray-900">${subtotal.toFixed(2)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">
                    Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
                  </dt>
                  <dd className="font-semibold text-green-600">-${discount.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="font-semibold text-gray-900">
                  {shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}
                </dd>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Tax</dt>
                  <dd className="font-semibold text-gray-900">${tax.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 text-base">
                <dt className="font-bold text-gray-900">Total</dt>
                <dd className="font-extrabold text-gray-900">${total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <Link
            href="/help"
            className="block text-center bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl text-sm"
          >
            Need Help With This Order?
          </Link>
        </div>
      </div>
    </div>
  );
}
