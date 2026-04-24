'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import { usersApi } from '@/lib/api';

export default function WishlistPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [wishlist, setWishlist] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/account/wishlist');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    usersApi.getWishlist()
      .then(({ data }) => setWishlist(data))
      .finally(() => setFetching(false));
  }, [user]);

  const remove = async (productId) => {
    await usersApi.toggleWishlist(productId);
    setWishlist((prev) => prev.filter((w) => w.product_id !== productId));
    toast.success('Removed from wishlist');
  };

  const addToCart = async (productId) => {
    try {
      await addItem(productId);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (loading || fetching) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <Link href="/products" className="btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="card overflow-hidden group">
              <div className="relative aspect-square bg-gray-50">
                <Link href={`/products/${item.slug}`}>
                  {item.images?.[0] ? (
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </Link>
              </div>
              <div className="p-3">
                <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600 line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-primary-600 font-bold mt-1">৳{parseFloat(item.price).toFixed(2)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => addToCart(item.product_id)} className="flex-1 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center" title="Add to cart">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(item.product_id)} className="p-2 border border-gray-300 hover:border-red-400 text-gray-500 hover:text-red-500 rounded-lg" title="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
