'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Lock, LogOut } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

export default function AccountPage() {
  const { user, logout, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/account');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const links = [
    { href: '/account/orders', icon: Package, label: 'My Orders', desc: 'Track your orders' },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: 'Saved items' },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage shipping addresses' },
    { href: '/account/security', icon: Lock, label: 'Security', desc: 'Update password' },
  ];

  if (user.role === 'admin') {
    links.unshift({ href: '/admin', icon: User, label: 'Admin Dashboard', desc: 'Manage the store' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {user.role === 'admin' && <span className="badge bg-primary-100 text-primary-700 mt-1">Admin</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary-50 rounded-xl">
              <Icon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}

        <button
          onClick={logout}
          className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow text-left w-full"
        >
          <div className="p-3 bg-red-50 rounded-xl">
            <LogOut className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-red-600">Sign Out</p>
            <p className="text-sm text-gray-500">Log out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
}
