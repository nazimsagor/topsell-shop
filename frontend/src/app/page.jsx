'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORY_ICONS = {
  electronics: '💻',
  clothing: '👗',
  'home-garden': '🏡',
  sports: '⚽',
  books: '📚',
  beauty: '💄',
  automotive: '🚗',
  'food-grocery': '🛒',
  'health-wellness': '💊',
  'toys-games': '🧸',
};

const HERO_SLIDES = [
  {
    image: '/banners/banner1.png',
    link: '/products?category=home-garden',
    btnText: 'Shop Now',
  },
  {
    image: '/banners/banner2.png',
    link: '/products?category=sports',
    btnText: 'View Deals',
  },
  {
    image: '/banners/banner3.png',
    link: '/products?category=toys-games',
    btnText: 'Explore',
  },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
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

      {/* Hero Slider */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px]">
          {HERO_SLIDES.map((s, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image} alt={`Banner ${i+1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-end pb-8 px-8">
                <Link href={s.link} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg">
                  {s.btnText} <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Slider controls */}
        <button onClick={prevSlide} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-xl transition-all hover:scale-110">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={nextSlide} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-xl transition-all hover:scale-110">
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`h-2.5 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-white/50 w-2.5'}`} />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $50', color: 'text-orange-500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-500' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day policy', color: 'text-blue-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <Icon className={`h-6 w-6 ${color} flex-shrink-0`} />
                <div>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-wider">
                Popular Categories
              </h2>
              <div className="mt-2 mx-auto w-20 h-1 bg-red-600 rounded-full" />
              <p className="mt-3 text-sm text-gray-500">Shop by your favorite category</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-red-600 bg-white flex items-center justify-center shadow-sm group-hover:bg-red-600 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <span className="text-4xl md:text-5xl">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-red-600 leading-tight transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
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