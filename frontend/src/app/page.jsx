import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getFeatured() {
  try {
    const res = await fetch(`${API}/products/featured`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getProducts() {
  try {
    const res = await fetch(`${API}/products?limit=8&sort=id&order=desc`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.products) ? data.products : [];
  } catch {
    return [];
  }
}

const CATEGORY_ICONS = {
  electronics: '💻',
  clothing: '👗',
  'home-garden': '🏡',
  sports: '⚽',
  books: '📚',
  beauty: '💄',
};

export default async function HomePage() {
  const [featured, categories, allProducts] = await Promise.all([
    getFeatured(), getCategories(), getProducts(),
  ]);
  const displayProducts = featured.length > 0 ? featured : allProducts;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-primary-200 text-sm font-semibold uppercase tracking-widest mb-3">Welcome to TopSell</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Discover thousands of products at unbeatable prices. Free shipping on orders over $50.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-lg shadow-lg">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/products?featured=true" className="inline-flex items-center justify-center border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg">
                Featured Deals
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -right-12 top-32 w-48 h-48 rounded-full bg-white/5" />
      </section>

      {/* Trust badges */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $50' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-100 rounded-lg flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-500 mt-1">Browse our wide selection of categories</p>
            </div>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
              >
                <span className="text-3xl mb-2">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                <span className="text-xs font-semibold text-gray-700 text-center group-hover:text-primary-700">{cat.name}</span>
                <span className="text-xs text-gray-400 mt-0.5">{cat.product_count} items</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {displayProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {featured.length > 0 ? 'Featured Products' : 'Latest Products'}
                </h2>
                <p className="text-gray-500 mt-1">Hand-picked for the best value</p>
              </div>
              <Link href="/products" className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join thousands of satisfied customers today</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg shadow-lg">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
