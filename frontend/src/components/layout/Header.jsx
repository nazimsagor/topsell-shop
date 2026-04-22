'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronDown, Phone, Headphones } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import CartSidebar from '../cart/CartSidebar';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: '💻' },
  { name: 'Clothing', slug: 'clothing', icon: '👗' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '🏡' },
  { name: 'Sports & Fitness', slug: 'sports', icon: '⚽' },
  { name: 'Books', slug: 'books', icon: '📚' },
  { name: 'Beauty', slug: 'beauty', icon: '💄' },
  { name: 'Automotive', slug: 'automotive', icon: '🚗' },
  { name: 'Food & Grocery', slug: 'food-grocery', icon: '🛒' },
  { name: 'Health & Wellness', slug: 'health-wellness', icon: '💊' },
  { name: 'Toys & Games', slug: 'toys-games', icon: '🧸' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchCat, setSearchCat] = useState('All');
  const router = useRouter();

  const { user, logout } = useAuthStore();
  const { openCart, items } = useCartStore();
  const cartCount = items.reduce((sum, i) => sum + (i.qty || 0), 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const slug = CATEGORIES.find(c => c.name === searchCat)?.slug;
      const params = new URLSearchParams();
      params.set('search', search.trim());
      if (slug) params.set('category', slug);
      router.push(`/products?${params.toString()}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main dark header */}
      <header className="sticky top-0 z-30 bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-20">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex flex-col leading-none">
              <span className="text-3xl font-extrabold text-red-500 tracking-tight">topsell</span>
              <span className="text-[11px] text-gray-400 mt-0.5 font-medium">Your trusted shop</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex max-w-3xl mx-4">
              <div className="w-full flex rounded-lg overflow-hidden shadow-md">
                <select
                  value={searchCat}
                  onChange={(e) => setSearchCat(e.target.value)}
                  className="bg-gray-100 hover:bg-gray-200 border-r border-gray-300 px-3 py-3 text-sm text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option>All</option>
                  {CATEGORIES.map(c => <option key={c.slug}>{c.name}</option>)}
                </select>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands and categories..."
                  className="flex-1 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 transition-colors">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Right nav */}
            <nav className="flex items-center gap-3 ml-auto">

              {/* Contact us */}
              <div className="hidden lg:flex items-center gap-2 text-white pr-3 border-r border-gray-700">
                <Headphones className="h-7 w-7 text-red-500" />
                <div className="leading-tight">
                  <p className="text-[11px] text-gray-400">Contact us</p>
                  <p className="text-sm font-bold">080 910 444</p>
                </div>
              </div>

              {/* User */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 text-white hover:text-red-400 transition-colors">
                    <User className="h-6 w-6" />
                    <div className="hidden md:block leading-tight text-left">
                      <p className="text-[11px] text-gray-400">Hello, {user.name.split(' ')[0]}</p>
                      <p className="text-sm font-bold flex items-center gap-0.5">Account <ChevronDown className="h-3 w-3" /></p>
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <Link href="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-gray-50">Admin Dashboard</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-1.5 text-white hover:text-red-400 transition-colors">
                  <User className="h-6 w-6" />
                  <div className="hidden md:block leading-tight">
                    <p className="text-[11px] text-gray-400">Sign in</p>
                    <p className="text-sm font-bold">Account</p>
                  </div>
                </Link>
              )}

              {/* Cart */}
              <button onClick={openCart} className="relative flex items-center gap-2 text-white hover:text-red-400 transition-colors pl-3 border-l border-gray-700" aria-label="Cart">
                <div className="relative">
                  <ShoppingCart className="h-7 w-7" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-gray-900">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden md:block leading-tight text-left">
                  <p className="text-[11px] text-gray-400">Your</p>
                  <p className="text-sm font-bold">Cart</p>
                </div>
              </button>

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Red navigation bar */}
        <div className="bg-red-600 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-11 gap-1">

              {/* Categories dropdown */}
              <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-sm font-bold px-5 h-11 transition-colors">
                  <Menu className="h-4 w-4" />
                  All Categories
                  <ChevronDown className="h-3 w-3" />
                </button>
                {catOpen && (
                  <div className="absolute left-0 top-full w-60 bg-white shadow-2xl border border-gray-200 z-50 rounded-b-lg overflow-hidden">
                    {CATEGORIES.map(cat => (
                      <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-b border-gray-100 last:border-0">
                        <span className="text-lg">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav links */}
              <Link href="/" className="text-white text-sm font-semibold px-4 h-11 flex items-center hover:bg-red-700 transition-colors">🏠 Home</Link>
              <Link href="/products?sort=created_at&order=desc" className="text-white text-sm font-semibold px-4 h-11 flex items-center hover:bg-red-700 transition-colors">🆕 New Products</Link>
              <Link href="/products?sort=sold_count&order=desc" className="text-white text-sm font-semibold px-4 h-11 flex items-center hover:bg-red-700 transition-colors">🔥 Bestsellers</Link>
              <Link href="/products?featured=true" className="text-white text-sm font-semibold px-4 h-11 flex items-center hover:bg-red-700 transition-colors">⭐ Featured</Link>
              <Link href="/products?category=electronics" className="text-white text-sm font-semibold px-4 h-11 flex items-center hover:bg-red-700 transition-colors">💻 Electronics</Link>
              <Link href="/products?category=sports" className="text-white text-sm font-semibold px-4 h-11 flex items-center hover:bg-red-700 transition-colors">⚽ Sports</Link>

              <span className="ml-auto text-white text-xs font-medium flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> 080 910 444
              </span>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 px-4 py-4 space-y-3 bg-gray-900">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-2 text-sm text-gray-200 py-2 hover:text-red-400"
                  onClick={() => setMenuOpen(false)}>
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
            {user ? (
              <>
                <Link href="/account" className="block text-sm text-gray-200 py-2" onClick={() => setMenuOpen(false)}>My Account</Link>
                <Link href="/account/orders" className="block text-sm text-gray-200 py-2" onClick={() => setMenuOpen(false)}>My Orders</Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block text-sm text-red-400 font-medium py-2" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block text-sm text-red-400 py-2">Sign Out</button>
              </>
            ) : (
              <Link href="/auth/login" className="block bg-red-600 text-white text-center font-semibold py-2.5 rounded-lg" onClick={() => setMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        )}
      </header>

      <CartSidebar />
    </>
  );
}
