'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

const BADGE_STYLES = {
  hot: 'bg-gradient-to-r from-red-500 to-orange-500',
  sale: 'bg-gradient-to-r from-pink-500 to-red-500',
  new: 'bg-gradient-to-r from-green-500 to-emerald-500',
  featured: 'bg-gradient-to-r from-purple-500 to-indigo-500',
};

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const user    = useAuthStore((s) => s.user);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const rating = parseFloat(product.rating) || 4.5;
  const reviewCount = product.review_count || Math.floor(Math.random() * 500) + 50;
  const categoryName = product.categories?.name ?? product.category_name ?? null;
  const badgeKey = (product.badge || '').toLowerCase();
  const badgeClass = BADGE_STYLES[badgeKey] || 'bg-gradient-to-r from-blue-500 to-cyan-500';

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-red-300 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            📦
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
            -{discount}%
          </span>
        )}

        {/* Custom badge (Hot, Sale, New) */}
        {product.badge && (
          <span className={`absolute top-2 right-2 ${badgeClass} text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md uppercase`}>
            {product.badge}
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-sm bg-red-600 px-3 py-1 rounded-md">Out of Stock</span>
          </div>
        )}

        {/* Quick add to cart on hover */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-sm font-bold py-2.5 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        {categoryName && (
          <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">
            {categoryName}
          </p>
        )}

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[40px] group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-red-600">
            ৳{parseFloat(product.price).toFixed(2)}
          </span>
          {product.old_price && (
            <span className="text-xs text-gray-400 line-through">
              ৳{parseFloat(product.old_price).toFixed(2)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold text-green-600 ml-auto">
              Save {discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
