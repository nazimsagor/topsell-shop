'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Users, Tag,
  Image as ImageIcon, Settings, Mail, FileText, Menu, X,
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

const NAV = [
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/products',   label: 'Products',   icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { href: '/admin/customers',  label: 'Customers',  icon: Users },
  { href: '/admin/coupons',    label: 'Coupons',    icon: Tag },
  { href: '/admin/banners',    label: 'Banners',    icon: ImageIcon },
  { href: '/admin/blog',       label: 'Blog',       icon: FileText },
  { href: '/admin/newsletters',label: 'Newsletters',icon: Mail },
  { href: '/admin/settings',   label: 'Settings',   icon: Settings },
];

export default function AdminShell({ children }) {
  const { user, loading, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth gate — done client-side so the shell can render shared chrome.
  if (!loading && (!user || user.role !== 'admin')) {
    if (typeof window !== 'undefined') router.replace('/');
    return null;
  }

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-gray-700"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-gray-900">Admin</span>
        <Link href="/" className="text-xs text-red-600 font-semibold">View site</Link>
      </div>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 shrink-0 border-r border-gray-200 bg-white min-h-screen sticky top-0">
          <SidebarContent isActive={isActive} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 lg:hidden">
              <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
                <span className="font-bold text-gray-900">Admin</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 -mr-2 text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ isActive, onNavigate }) {
  return (
    <div className="py-6">
      <Link
        href="/"
        className="hidden lg:block px-6 mb-6 text-2xl font-extrabold text-red-600 tracking-tight"
      >
        topsell
      </Link>
      <nav className="px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-red-600' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
