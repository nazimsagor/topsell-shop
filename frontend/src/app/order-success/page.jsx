'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Loader2, Package } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import { ordersApi } from '../../lib/api';

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCartStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment was completed server-side — make sure the local cart is empty too.
  useEffect(() => {
    clearCart?.();
  }, [clearCart]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    ordersApi.getOne(orderId)
      .then(({ data }) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
      </div>
    );
  }

  const ref = order?.order_number || (order?.id ? String(order.id) : orderId || '');
  const items = order?.order_items || [];
  const num = (v) => parseFloat(v || 0) || 0;
  const total = num(order?.total);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 shadow-sm text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        {ref && (
          <p className="text-sm text-gray-500 mb-6">
            Order Number:{' '}
            <span className="font-mono font-semibold text-gray-900">#{ref}</span>
          </p>
        )}

        {order && (
          <div className="text-left border-t border-gray-100 pt-6 mt-6 space-y-4">
            {items.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Items ({items.length})
                </h2>
                {items.map((item) => {
                  const p = item.products || {};
                  const price = num(item.price);
                  const qty = item.qty ?? item.quantity ?? 1;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {qty} × ৳{price.toFixed(0)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ৳{(price * qty).toFixed(0)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {total > 0 && (
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-4">
                <span>Total Paid</span>
                <span>৳{total.toFixed(0)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold px-6 py-3 rounded-xl"
          >
            View My Orders
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        A confirmation email has been sent to your registered email address.
      </p>
    </div>
  );
}
