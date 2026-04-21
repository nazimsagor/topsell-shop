'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, Package } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import CartSidebar from '../cart/CartSidebar';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
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
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Package className="h-7 w-7 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">TopSell</span>
            </Link>

            {/* Search — desktop */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex max-w-xl">
              <div className="relative w-full">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right nav */}
            <nav className="flex items-center gap-1">
              <Link
                href="/products"
                className="hidden md:block text-sm font-medium text-gray-600 hover:text-primary-600 px-3 py-2"
              >
                Products
              </Link>

              {/* Cart button — opens sidebar */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Wishlist */}
              {user && (
                <Link
                  href="/account/wishlist"
                  className="p-2 text-gray-600 hover:text-primary-600 hidden sm:block transition-colors"
                >
                  <Heart className="h-6 w-6" />
                </Link>
              )}

              {/* User dropdown */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-primary-600 transition-colors">
                    <User className="h-6 w-6" />
                    <span className="hidden md:block text-sm font-medium">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <Link href="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-50">
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </nav>
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
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link href="/products" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            {user ? (
              <>
                <Link href="/account" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>My Account</Link>
                <Link href="/account/orders" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>My Orders</Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block text-sm text-primary-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block text-sm text-red-600 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block bg-primary-600 text-white text-center font-semibold py-2.5 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart sidebar rendered outside header stacking context */}
      <CartSidebar />
    </>
  );
}
