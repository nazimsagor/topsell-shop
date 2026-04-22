'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, Package, ChevronDown, Phone } from 'lucide-react';
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
  const router = useRouter();

  const { user, logout } = useAuthStore();
  const { openCart, items } = useCartStore();
  const cartCount = items.reduce((sum, i) => sum + (i.qty || 0), 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5 px-4 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> 080 910 444</span>
          <span>support@topsell.shop</span>
        </div>
        <span>🚚 Free shipping on orders over $50!</span>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Package className="h-7 w-7 text-red-600" />
              <span className="text-xl font-bold text-gray-900">TopSell</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex max-w-2xl">
              <div className="relative w-full flex">
                <select className="border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 focus:outline-none">
                  <option>All</option>
                  {CATEGORIES.map(c => <option key={c.slug}>{c.name}</option>)}
                </select>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-r-lg transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right nav */}
            <nav className="flex items-center gap-2">
              {/* Cart */}
              <button onClick={openCart} className="relative p-2 text-gray-600 hover:text-red-600 transition-colors" aria-label="Cart">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Wishlist */}
              {user && (
                <Link href="/account/wishlist" className="p-2 text-gray-600 hover:text-red-600 hidden sm:block transition-colors">
                  <Heart className="h-6 w-6" />
                </Link>
              )}

              {/* User */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <User className="h-6 w-6" />
                    <span className="hidden md:block text-sm font-medium">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
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
                <Link href="/auth/login" className="hidden sm:block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Red navigation bar */}
        <div className="bg-red-600 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-10 gap-1">

              {/* Categories dropdown */}
              <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-4 h-10 transition-colors">
                  <Menu className="h-4 w-4" />
                  Categories
                  <ChevronDown className="h-3 w-3" />
                </button>
                {catOpen && (
                  <div className="absolute left-0 top-full w-56 bg-white shadow-xl border border-gray-200 z-50">
                    {CATEGORIES.map(cat => (
                      <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <span>{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav links */}
              <Link href="/" className="text-white text-sm font-medium px-4 h-10 flex items-center hover:bg-red-700 transition-colors">🏠 Home</Link>
              <Link href="/products?sort=created_at&order=desc" className="text-white text-sm font-medium px-4 h-10 flex items-center hover:bg-red-700 transition-colors">🆕 New Products</Link>
              <Link href="/products?sort=sold_count&order=desc" className="text-white text-sm font-medium px-4 h-10 flex items-center hover:bg-red-700 transition-colors">🔥 Bestsellers</Link>
              <Link href="/products?featured=true" className="text-white text-sm font-medium px-4 h-10 flex items-center hover:bg-red-700 transition-colors">⭐ Featured</Link>
              <Link href="/products?category=electronics" className="text-white text-sm font-medium px-4 h-10 flex items-center hover:bg-red-700 transition-colors">💻 Electronics</Link>
              <Link href="/products?category=sports" className="text-white text-sm font-medium px-4 h-10 flex items-center hover:bg-red-700 transition-colors">⚽ Sports</Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 px-4 py-4 space-y-3 bg-white">
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
                  className="flex items-center gap-2 text-sm text-gray-700 py-2 hover:text-red-600"
                  onClick={() => setMenuOpen(false)}>
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
            {user ? (
              <>
                <Link href="/account" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>My Account</Link>
                <Link href="/account/orders" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>My Orders</Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block text-sm text-red-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block text-sm text-red-600 py-2">Sign Out</button>
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