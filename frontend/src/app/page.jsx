'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Truck, Shield, RefreshCw, Headphones,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Flame, Mail, Sparkles, Gift, Star,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductCard from '../components/products/ProductCard';
import { newsletterApi, blogApi } from '../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORY_ICONS = {
  'aroma-diffusers': '🕯️', 'automotive': '🚗', 'bathroom': '🚿',
  'beauty-personal-care': '💄', 'books': '📚', 'camping': '⛺',
  'car-accessories': '🔧', 'childrens-goods': '🧸', 'christmas': '🎄',
  'clothing': '👗', 'cosmetics': '💋', 'electronics': '💻',
  'fitness': '🏋️', 'food-grocery': '🛒', 'garden': '🌱',
  'health': '💊', 'health-wellness': '❤️', 'home-garden': '🏡',
  'home-craftsman': '🔨', 'kitchen': '🍳', 'pets': '🐾',
  'shaving-and-haircut': '✂️', 'solar-lighting': '☀️', 'sports': '⚽',
  'sports-fitness': '🏃', 'toys-games': '🎮', 'video-surveillance': '📹',
};

// NOTE: blog posts are fetched live from Supabase via /api/blog on mount.
// Because this file is `'use client'`, an `export const revalidate = 60`
// would be ignored — instead, the client always fetches fresh data when the
// homepage renders, which achieves the same "no stale posts" goal.
function formatBlogDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return ''; }
}

const FALLBACK_HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=550&fit=crop',
    link: '/products',
    title: "Bangladesh's Best Online Shop",
    subtitle: 'Everything you need, delivered to your door',
    cta: 'Shop Now',
  },
];

// -------- helpers ---------------------------------------------------------

function useCountdown(hours = 24) {
  const [end] = useState(() => Date.now() + hours * 60 * 60 * 1000);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, end - now);
  const h = String(Math.floor(diff / 3.6e6)).padStart(2, '0');
  const m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, '0');
  const s = String(Math.floor((diff % 6e4) / 1000)).padStart(2, '0');
  return { h, m, s };
}

function ProductRail({ products }) {
  const ref = useRef(null);
  const scroll = (dx) => ref.current?.scrollBy({ left: dx, behavior: 'smooth' });
  return (
    <div className="relative">
      <button onClick={() => scroll(-400)} aria-label="Scroll left" className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-900 rounded-full p-2 shadow-lg border border-gray-200">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => scroll(400)} aria-label="Scroll right" className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-900 rounded-full p-2 shadow-lg border border-gray-200">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
        {products.map((p) => (
          <div key={p.id} className="flex-shrink-0 snap-start w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, viewAllHref, icon: Icon, accent = 'text-gray-900' }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-wide flex items-center gap-2 ${accent}`}>
          {Icon && <Icon className="h-7 w-7" />}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// -------- page ------------------------------------------------------------

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(FALLBACK_HERO_SLIDES);
  const [showAllCats, setShowAllCats] = useState(false);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [hotDeals, setHotDeals]     = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);

  const countdown = useCountdown(24);

  useEffect(() => {
    // Valid sort columns on the backend are: id | name | price | stock.
    // id:desc is used as a proxy for "newest" (id is BIGSERIAL).
    fetch(`${API}/categories`).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/banners?active=true`).then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : [];
      if (!list.length) return;
      const mapped = list
        .filter(b => b.image)
        .map(b => ({
          image: b.image,
          link: b.link_url || '/products',
          title: b.title || '',
          subtitle: b.subtitle || '',
          cta: b.cta_label || 'Shop Now',
        }));
      if (mapped.length) {
        setHeroSlides(mapped);
        setSlide(0);
      }
    }).catch(() => {});
    fetch(`${API}/products/featured`).then(r => r.json()).then(d => setFeatured(Array.isArray(d) ? d.slice(0, 8) : [])).catch(() => {});
    fetch(`${API}/products?limit=8&sort=id&order=desc`).then(r => r.json()).then(d => setNewProducts(Array.isArray(d.products) ? d.products : [])).catch(() => {});
    // Latest 3 blog posts — backend already returns them sorted by published_at DESC.
    blogApi.list()
      .then(({ data }) => setBlogPosts(Array.isArray(data?.posts) ? data.posts.slice(0, 3) : []))
      .catch(() => {});
    fetch(`${API}/products?limit=8&badge=BESTSELLER`).then(r => r.json()).then(d => setBestsellers(Array.isArray(d.products) ? d.products : [])).catch(() => {});
    // Hot deals — try HOT first, fall back to SALE if empty.
    fetch(`${API}/products?limit=8&badge=HOT`).then(r => r.json()).then(async d => {
      const list = Array.isArray(d.products) ? d.products : [];
      if (list.length) return setHotDeals(list);
      const sale = await fetch(`${API}/products?limit=8&badge=SALE`).then(r => r.json()).catch(() => ({}));
      setHotDeals(Array.isArray(sale.products) ? sale.products : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const t = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  const prevSlide = () => setSlide(s => (s - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setSlide(s => (s + 1) % heroSlides.length);

  const [newsletterSaving, setNewsletterSaving] = useState(false);
  const handleNewsletter = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;
    setNewsletterSaving(true);
    try {
      await newsletterApi.subscribe(email);
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      toast.success('Successfully subscribed!');
      setTimeout(() => setNewsletterSubmitted(false), 4000);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error
        || (status === 409 ? 'This email is already subscribed' : 'Failed to subscribe');
      toast.error(msg);
    } finally {
      setNewsletterSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ============ HERO SLIDER ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-md">
          <div className="relative w-full h-[340px] md:h-[450px] lg:h-[550px]">
            {heroSlides.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
              >
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                {/* Headline + CTA */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-6 sm:px-12 lg:px-16 max-w-2xl">
                    <span className="inline-block bg-red-600 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                      Welcome to TopSell
                    </span>
                    <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-3">
                      {s.title}
                    </h1>
                    <p className="text-white/90 text-sm sm:text-lg mb-5 max-w-md">
                      {s.subtitle}
                    </p>
                    <Link
                      href={s.link}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
                    >
                      {s.cta} <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows (hidden when only one slide) */}
          {heroSlides.length > 1 && (
            <>
              <button onClick={prevSlide} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2.5 sm:p-3 shadow-xl transition-all hover:scale-110">
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button onClick={nextSlide} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2.5 sm:p-3 shadow-xl transition-all hover:scale-110">
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.length > 1 && heroSlides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Go to slide ${i+1}`} className={`h-2.5 rounded-full transition-all ${i === slide ? 'bg-white w-8' : 'bg-white/60 w-2.5'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES BAR ============ */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck,      title: 'Free Shipping', desc: 'On orders over ৳5,000', color: 'bg-orange-100 text-orange-600' },
              { icon: Shield,     title: 'Secure Payment', desc: 'SSL encrypted',         color: 'bg-green-100 text-green-600' },
              { icon: RefreshCw,  title: 'Easy Returns',   desc: '7-day return policy',   color: 'bg-blue-100 text-blue-600' },
              { icon: Headphones, title: '24/7 Support',   desc: 'Dedicated team',        color: 'bg-purple-100 text-purple-600' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="leading-tight min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
                  <p className="text-xs text-gray-500 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ POPULAR CATEGORIES ============ */}
      {categories.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Shop by Category"
              subtitle="Browse our most popular collections"
              viewAllHref="/products"
            />
            {(() => {
              const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
              const visible = showAllCats ? sorted : sorted.slice(0, 12);
              return (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {visible.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="group bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-4 text-center"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center overflow-hidden group-hover:from-red-100 group-hover:to-orange-100 transition-colors mb-3">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-3xl sm:text-4xl">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                          )}
                        </div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-red-600 line-clamp-2 transition-colors">
                          {cat.name}
                        </span>
                        {cat.product_count != null && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">{cat.product_count} items</span>
                        )}
                      </Link>
                    ))}
                  </div>
                  {sorted.length > 12 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => setShowAllCats(v => !v)}
                        className="inline-flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 text-sm font-bold border-2 border-red-600 px-6 py-2.5 rounded-full transition-colors"
                      >
                        {showAllCats ? <>Show Less <ChevronUp className="h-4 w-4" /></> : <>See All Categories <ChevronDown className="h-4 w-4" /></>}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* ============ FLASH SALE / HOT DEALS ============ */}
      {hotDeals.length > 0 && (
        <section className="bg-gradient-to-br from-red-600 via-red-600 to-orange-600 py-12 relative overflow-hidden">
          {/* Decorative stars */}
          <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
            <Sparkles className="h-24 w-24 text-white" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10 pointer-events-none">
            <Flame className="h-32 w-32 text-white" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                  <Flame className="h-4 w-4" /> Limited Time Offer
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wide">Flash Sale</h2>
                <p className="text-white/80 text-sm mt-1">Grab these deals before time runs out!</p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2">
                {[
                  { label: 'Hrs', value: countdown.h },
                  { label: 'Min', value: countdown.m },
                  { label: 'Sec', value: countdown.s },
                ].map((u, i, arr) => (
                  <div key={u.label} className="flex items-center gap-2">
                    <div className="bg-white text-red-600 font-extrabold rounded-lg px-3 py-2 min-w-[56px] text-center shadow-lg">
                      <div className="text-2xl leading-none font-mono">{u.value}</div>
                      <div className="text-[10px] text-red-500 mt-0.5 font-semibold">{u.label}</div>
                    </div>
                    {i < arr.length - 1 && <span className="text-white text-xl font-extrabold">:</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl">
              <ProductRail products={hotDeals} />
              <div className="text-center mt-5">
                <Link href="/products?badge=HOT" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                  View All Hot Deals <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ FEATURED PRODUCTS ============ */}
      {featured.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Featured Products"
              subtitle="Handpicked by our team"
              viewAllHref="/products?featured=true"
              icon={Star}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ PROMO BANNERS (New Arrivals + Special Offers) ============ */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New Arrivals */}
            <Link
              href="/products?badge=NEW"
              className="relative overflow-hidden rounded-2xl group bg-gradient-to-br from-red-600 to-red-700 min-h-[180px] p-8 flex items-center"
            >
              <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
                <Sparkles className="h-40 w-40 text-white transform rotate-12 translate-x-6 -translate-y-4" />
              </div>
              <div className="relative text-white">
                <span className="inline-block bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest mb-3">
                  Just In
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">New Arrivals</h3>
                <p className="text-white/80 text-sm mb-4 max-w-xs">Fresh picks added every week. Be the first to shop.</p>
                <span className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2 rounded-lg text-sm group-hover:bg-gray-100 transition-colors">
                  Shop New <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Special Offers */}
            <Link
              href="/products?badge=SALE"
              className="relative overflow-hidden rounded-2xl group bg-gradient-to-br from-red-700 via-red-600 to-orange-600 min-h-[180px] p-8 flex items-center"
            >
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <Gift className="h-40 w-40 text-white transform -rotate-12 translate-x-6 translate-y-4" />
              </div>
              <div className="relative text-white">
                <span className="inline-block bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest mb-3">
                  Up to 50% off
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">Special Offers</h3>
                <p className="text-white/80 text-sm mb-4 max-w-xs">Don't miss out on these exclusive deals and savings.</p>
                <span className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2 rounded-lg text-sm group-hover:bg-gray-100 transition-colors">
                  Shop Deals <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ BESTSELLERS ============ */}
      {bestsellers.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Bestsellers"
              subtitle="What our customers love most"
              viewAllHref="/products?badge=BESTSELLER"
              icon={Flame}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestsellers.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ NEW PRODUCTS RAIL ============ */}
      {newProducts.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="New Products"
              subtitle="Check out our latest additions"
              viewAllHref="/products?badge=NEW"
              icon={Sparkles}
            />
            <ProductRail products={newProducts} />
          </div>
        </section>
      )}

      {/* ============ BLOG ============ */}
      {blogPosts.length > 0 && (
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="From the Blog" subtitle="Tips, reviews and shopping guides" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug || post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-5xl">📝</div>
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{formatBlogDate(post.published_at)}</span>
                    <span className="text-sm font-semibold text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white mb-4">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Subscribe to Our Newsletter</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-6">
            Get exclusive deals, new arrivals, and shopping tips straight to your inbox.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
            <button
              type="submit"
              disabled={newsletterSaving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              {newsletterSaving ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
          {newsletterSubmitted && (
            <p className="text-green-400 text-sm font-semibold mt-4">
              ✓ Thanks for subscribing! Check your inbox for a welcome offer.
            </p>
          )}
          <p className="text-gray-500 text-xs mt-4">
            By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
