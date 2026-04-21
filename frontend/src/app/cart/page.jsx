'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';

export default function CartPage() {
  const { items, subtotal, updateItem, removeItem, loading } = useCartStore();
  const [updatingId, setUpdatingId] = useState(null);

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleUpdate = async (id, quantity) => {
    setUpdatingId(id);
    try {
      await updateItem(id, quantity);
    } catch {
      toast.error('Failed to update cart');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeItem(id);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to get started</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                {item.images?.[0] ? (
                  <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                  {item.name}
                </Link>
                {item.variant_name && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}: {item.variant_value}</p>
                )}
                <p className="text-primary-600 font-bold mt-1">${parseFloat(item.price).toFixed(2)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={updatingId === item.id}
                      className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updatingId === item.id || item.quantity >= item.stock}
                      className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-primary-600 bg-primary-50 rounded-lg p-2">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center mt-6 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/products" className="btn-secondary w-full text-center mt-3 flex items-center justify-center gap-2 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
