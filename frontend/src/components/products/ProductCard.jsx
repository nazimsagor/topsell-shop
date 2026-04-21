'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const user    = useAuthStore((s) => s.user);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    try {
      await addItem(product.id, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  const categoryName = product.categories?.name ?? product.category_name ?? null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            📦
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.badge && (
          <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {product.badge}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        {categoryName && (
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
            {categoryName}
          </p>
        )}

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 flex-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.old_price && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${parseFloat(product.old_price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
