'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

export default function CartSidebar() {
  const { items, subtotal, isCartOpen, closeCart, updateItem, removeItem, loading } = useCartStore();
  const user = useAuthStore((s) => s.user);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary-600" />
            <h2 className="font-bold text-lg text-gray-900">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Add some products to get started</p>
              <button
                onClick={closeCart}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.products || {};
                return (
                  <div key={item.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-primary-600 mt-1">
                        ৳{parseFloat(product.price || 0).toFixed(2)}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => item.qty <= 1 ? removeItem(item.id) : updateItem(item.id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateItem(item.id, item.qty + 1)}
                          disabled={item.qty >= (product.stock || 99)}
                          className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-lg text-gray-900">৳{parseFloat(subtotal).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
            <div className="flex gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex-1 text-center border border-gray-300 hover:border-primary-500 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                View Cart
              </Link>
              <Link
                href={user ? '/checkout' : '/auth/login'}
                onClick={closeCart}
                className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {user ? 'Checkout' : 'Sign in to Checkout'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
