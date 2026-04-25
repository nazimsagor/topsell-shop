'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Truck, Shield, ChevronLeft, Plus, Minus, Tag, Star, Clock, Sparkles, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '../../../store/useCartStore';
import useAuthStore from '../../../store/useAuthStore';
import { productsApi, usersApi } from '../../../lib/api';
import ProductRail from '../../../components/products/ProductRail';

const RECENTLY_VIEWED_KEY = 'topsell:recently-viewed';
const RECENTLY_VIEWED_MAX = 8;

// --- Reusable star row ---------------------------------------------------
function Stars({ value = 0, size = 'h-4 w-4' }) {
  return (
    <div className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [quantity, setQuantity]   = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Reviews
  const [reviews, setReviews]           = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover]   = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Discovery rails
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [alsoLike, setAlsoLike]             = useState([]);
  const [related, setRelated]               = useState([]);
  const [recommended, setRecommended]       = useState([]);

  // Tabs (details | reviews)
  const [activeTab, setActiveTab] = useState('details');

  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    productsApi.getOne(slug)
      .then(({ data }) => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  // Fetch reviews once we know the product id
  useEffect(() => {
    if (!product?.id) return;
    productsApi.getReviews(product.id)
      .then(({ data }) => {
        setReviews(data.reviews || []);
        setReviewSummary(data.summary || { average: 0, count: 0 });
      })
      .catch(() => {});
  }, [product?.id]);

  // --- Recently viewed (localStorage) ----------------------------------
  useEffect(() => {
    if (!product?.id || !product?.slug || typeof window === 'undefined') return;
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      if (!Array.isArray(stored)) stored = [];
    } catch { stored = []; }

    // Build the list of slugs to fetch — exclude current product, take last N.
    const others = stored.filter((s) => s && s !== product.slug).slice(0, RECENTLY_VIEWED_MAX);

    if (others.length) {
      Promise.all(
        others.map((s) => productsApi.getOne(s).then((r) => r.data).catch(() => null))
      ).then((items) => setRecentlyViewed(items.filter(Boolean)));
    } else {
      setRecentlyViewed([]);
    }

    // Persist current slug at the front, dedup, cap length.
    const next = [product.slug, ...stored.filter((s) => s !== product.slug)].slice(0, RECENTLY_VIEWED_MAX + 1);
    try { localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next)); } catch {}
  }, [product?.id, product?.slug]);

  // --- You may also like (same category) -------------------------------
  useEffect(() => {
    if (!product?.id) return;
    const categorySlug = product.categories?.slug ?? product.category_slug;
    if (!categorySlug) { setAlsoLike([]); return; }
    productsApi.getAll({ category: categorySlug, limit: 12 })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setAlsoLike(list.filter((p) => p.id !== product.id).slice(0, 8));
      })
      .catch(() => setAlsoLike([]));
  }, [product?.id]);

  // --- Related (same badge OR similar price range) ---------------------
  useEffect(() => {
    if (!product?.id) return;

    const collect = async () => {
      const out = [];
      const seen = new Set([product.id]);

      // Try same badge first.
      if (product.badge) {
        try {
          const { data } = await productsApi.getAll({ badge: product.badge, limit: 12 });
          const list = Array.isArray(data) ? data : data.products || [];
          for (const p of list) if (!seen.has(p.id)) { out.push(p); seen.add(p.id); }
        } catch {}
      }

      // Then top up with similar price range (±30%).
      if (out.length < 8) {
        const price = parseFloat(product.price) || 0;
        const min = Math.max(0, price * 0.7);
        const max = price * 1.3;
        try {
          const { data } = await productsApi.getAll({ minPrice: Math.floor(min), maxPrice: Math.ceil(max), limit: 16 });
          const list = Array.isArray(data) ? data : data.products || [];
          for (const p of list) {
            if (out.length >= 8) break;
            if (!seen.has(p.id)) { out.push(p); seen.add(p.id); }
          }
        } catch {}
      }

      setRelated(out.slice(0, 8));
    };
    collect();
  }, [product?.id]);

  // --- Recommended (featured, with random top-up) ----------------------
  useEffect(() => {
    if (!product?.id) return;
    const fetchRec = async () => {
      const seen = new Set([product.id]);
      const out = [];
      try {
        const { data } = await productsApi.getAll({ badge: 'FEATURED', limit: 12 });
        const list = Array.isArray(data) ? data : data.products || [];
        for (const p of list) if (!seen.has(p.id)) { out.push(p); seen.add(p.id); }
      } catch {}
      if (out.length < 8) {
        try {
          const { data } = await productsApi.getAll({ limit: 16 });
          const list = Array.isArray(data) ? data : data.products || [];
          // Shuffle for a random mix.
          const shuffled = [...list].sort(() => Math.random() - 0.5);
          for (const p of shuffled) {
            if (out.length >= 8) break;
            if (!seen.has(p.id)) { out.push(p); seen.add(p.id); }
          }
        } catch {}
      }
      setRecommended(out.slice(0, 8));
    };
    fetchRec();
  }, [product?.id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to write a review');
    if (!reviewRating) return toast.error('Pick a star rating');
    setSubmittingReview(true);
    try {
      await productsApi.addReview(product.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      const { data } = await productsApi.getReviews(product.id);
      setReviews(data.reviews || []);
      setReviewSummary(data.summary || { average: 0, count: 0 });
      setReviewRating(0);
      setReviewComment('');
      toast.success('Thanks for your review!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      router.push('/auth/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
      toast.success('Added to cart!');
      openCart();
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Sign in to save items to wishlist');
    try {
      const { data } = await usersApi.toggleWishlist(product.id);
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link href="/products" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  const categoryName = product.categories?.name ?? product.category_name ?? null;
  const categorySlug = product.categories?.slug ?? product.category_slug ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">📦</div>
          )}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span className="absolute top-4 right-4 bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {product.badge}
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          {categoryName && (
            <Link
              href={`/products?category=${categorySlug}`}
              className="text-xs font-semibold text-primary-600 uppercase tracking-wide hover:underline"
            >
              {categoryName}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-2">
            {product.name}
          </h1>

          {/* Rating summary */}
          <a href="#reviews" className="inline-flex items-center gap-2 mb-4 group">
            <Stars value={reviewSummary.average} />
            <span className="text-sm font-semibold text-gray-700">
              {reviewSummary.count > 0 ? reviewSummary.average.toFixed(1) : 'No ratings'}
            </span>
            <span className="text-sm text-gray-500 group-hover:text-red-600 group-hover:underline">
              ({reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'})
            </span>
          </a>

          {/* Price */}
          <div className="flex items-end gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">
              ৳{parseFloat(product.price).toFixed(0)}
            </span>
            {product.old_price && (
              <span className="text-xl text-gray-400 line-through">
                ৳{parseFloat(product.old_price).toFixed(0)}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-100 text-red-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-5">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                In Stock &mdash; {product.stock} available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Short description preview */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-7">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors text-base"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-xl border-2 transition-colors ${
                wishlisted
                  ? 'border-red-400 bg-red-50 text-red-500'
                  : 'border-gray-300 hover:border-gray-400 text-gray-600'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Trust signals */}
          <div className="space-y-2.5 text-sm text-gray-600 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-500 flex-shrink-0" />
              Free shipping on orders over ৳5,000
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
              Secure checkout &amp; 30-day returns
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Product Details | Customer Reviews */}
      <section id="reviews" className="scroll-mt-24 border-t border-gray-200 pt-10 pb-4">
        {/* Tab bar */}
        <div role="tablist" aria-label="Product information" className="flex gap-2 sm:gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { key: 'details', label: 'Product Details' },
            { key: 'reviews', label: `Customer Reviews (${reviewSummary.count})` },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3 sm:px-4 py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
                <span
                  className={`pointer-events-none absolute left-0 right-0 -bottom-px h-0.5 rounded-full transition-all ${
                    active ? 'bg-red-600 scale-x-100' : 'bg-transparent scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Tab panel: Product Details */}
        {activeTab === 'details' && (
          <div role="tabpanel" className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About this product</h2>

            {product.description ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {product.description}
              </p>
            ) : (
              <p className="text-gray-500 italic mb-6">No description provided.</p>
            )}

            {/* Key features */}
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Key features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              {categoryName && (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><span className="font-semibold">Category:</span> {categoryName}</span>
                </li>
              )}
              {product.badge && (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-red-600" /> {product.badge}
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span>
                  <span className="font-semibold">Availability:</span>{' '}
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span><span className="font-semibold">Price:</span> ৳{parseFloat(product.price).toFixed(0)}</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Free shipping on orders over ৳5,000</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Secure checkout &amp; 30-day returns</span>
              </li>
            </ul>
          </div>
        )}

        {/* Tab panel: Customer Reviews */}
        {activeTab === 'reviews' && (
        <div role="tabpanel" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.2s_ease-out]">

          {/* Summary + Write a review */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-gray-900">
                  {reviewSummary.count > 0 ? reviewSummary.average.toFixed(1) : '—'}
                </span>
                <div>
                  <Stars value={reviewSummary.average} size="h-5 w-5" />
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>

            {/* Write a review */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your rating</label>
                    <div
                      className="inline-flex items-center gap-1"
                      onMouseLeave={() => setReviewHover(0)}
                    >
                      {[1, 2, 3, 4, 5].map((n) => {
                        const active = (reviewHover || reviewRating) >= n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            onMouseEnter={() => setReviewHover(n)}
                            className="p-0.5"
                            aria-label={`Rate ${n} stars`}
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                active ? 'text-red-500 fill-red-500' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your review
                    </label>
                    <textarea
                      id="review-comment"
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview || !reviewRating}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-sm text-gray-600">
                  <p className="mb-3">Please sign in to write a review.</p>
                  <Link
                    href={`/auth/login?redirect=/products/${slug}`}
                    className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm"
                  >
                    Login to Write a Review
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Review list */}
          <div className="lg:col-span-2">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <p className="text-4xl mb-3">⭐</p>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                <p className="text-sm text-gray-500">Be the first to share your thoughts on this product.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                          {(r.user_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{r.user_name}</p>
                          <Stars value={r.rating} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        )}
      </section>

      {/* Discovery rails */}
      <ProductRail title="Last Viewed Products" icon={Clock} products={recentlyViewed} />
      <ProductRail title="You May Also Like" icon={Layers} products={alsoLike} />
      <ProductRail title="Related Products" icon={Tag} products={related} />
      <ProductRail title="Recommended For You" icon={Sparkles} products={recommended} />
    </div>
  );
}
