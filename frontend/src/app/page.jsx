'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';

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

const HERO_SLIDES = [
  { image: '/banners/banner1.png', link: '/products?category=home-garden' },
  { image: '/banners/banner2.png', link: '/products?category=sports' },
  { image: '/banners/banner3.png', link: '/products?category=toys-games' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [showAllCats, setShowAllCats] = useState(false);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/products/featured`).then(r => r.json()).then(d => setFeatured(Array.isArray(d) ? d.slice(0, 8) : [])).catch(() => {});
    fetch(`${API}/products?limit=8&sort=created_at&order=desc`).then(r => r.json()).then(d => setNewProducts(Array.isArray(d.products) ? d.products : [])).catch(() => {});
    fetch(`${API}/products?limit=8&sort=sold_count&order=desc`).then(r => r.json()).then(d => setBestsellers(Array.isArray(d.products) ? d.products : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const prevSlide = () => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () => setSlide(s => (s + 1) % HERO_SLIDES.length);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-md">
          <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
            {HERO_SLIDES.map((s, i) => (
              <Link
                key={i}
                href={s.link}
                className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${i === slide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
              >
                <img src={s.image} alt={`Banner ${i+1}`} className="w-full h-full object-cover" />
              </Link>
            ))}
          </div>

          {/* Arrows */}
          <button onClick={prevSlide} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-xl transition-all hover:scale-110">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={nextSlide} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-xl transition-all hover:scale-110">
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Go to slide ${i+1}`} className={`h-2.5 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-white/60 w-2.5'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $50', color: 'text-orange-500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-500' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day policy', color: 'text-blue-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-2 py-1">
                <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                <div className="leading-tight">
                  <p className="text-xs font-bold text-gray-900">{title}</p>
                  <p className="text-[10px] text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="inline-block text-xl font-bold text-gray-900 uppercase tracking-wide border-l-4 border-red-600 pl-3 mx-auto">
                Popular Categories
              </h2>
            </div>
            {(() => {
              const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
              const visible = showAllCats ? sorted : sorted.slice(0, 16);
              return (
                <>
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4 justify-center">
                    {visible.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="group flex flex-col items-center gap-2"
                      >
                        <div className="w-20 h-20 rounded-full border-2 border-red-500 bg-white flex items-center justify-center overflow-hidden group-hover:bg-red-500 group-hover:scale-105 transition-all duration-300">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center group-hover:text-red-600 leading-tight transition-colors line-clamp-2">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {sorted.length > 16 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => setShowAllCats(v => !v)}
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-bold border-2 border-red-600 hover:border-red-700 px-5 py-2 rounded-full transition-colors"
                      >
                        {showAllCats ? (
                          <>Show Less <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>See All Categories <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide border-l-4 border-red-600 pl-3">Bestsellers</h2>
              <Link href="/products?sort=sold_count&order=desc" className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestsellers.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide border-l-4 border-red-600 pl-3">New Products</h2>
              <Link href="/products?sort=created_at&order=desc" className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured / Recommended */}
      {featured.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide border-l-4 border-red-600 pl-3">Recommended Items</h2>
              <Link href="/products?featured=true" className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Start Shopping?</h2>
          <p className="text-white/80 mb-6 text-lg">Join thousands of satisfied customers today</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}