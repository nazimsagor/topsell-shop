'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Truck } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/account/orders');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    ordersApi.getAll()
      .then(({ data }) => setOrders(data))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0">
                  <span className="font-mono font-bold text-gray-900">{order.order_number}</span>
                  <span className={`ml-3 inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="font-semibold text-gray-900">৳{parseFloat(order.total).toFixed(0)}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  <Truck className="h-4 w-4" /> Track Order
                </Link>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
