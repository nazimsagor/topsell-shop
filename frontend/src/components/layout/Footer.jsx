'use client';
import Link from 'next/link';
import { Package, Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import useSiteSettings from '../../lib/useSiteSettings';

export default function Footer() {
  const s = useSiteSettings();

  const socials = [
    { url: s.social_facebook,  Icon: Facebook,  label: 'Facebook' },
    { url: s.social_instagram, Icon: Instagram, label: 'Instagram' },
    { url: s.social_youtube,   Icon: Youtube,   label: 'YouTube' },
  ].filter((x) => x.url);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white mb-4">
              <Package className="h-7 w-7 text-primary-500" />
              <span className="text-xl font-bold">{s.store_name}</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Your trusted online marketplace for quality products at unbeatable prices.
            </p>
            <ul className="space-y-2 text-sm mb-4">
              {s.store_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary-500 flex-shrink-0" />
                  <span>{s.store_address}</span>
                </li>
              )}
              {s.store_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                  <a href={`tel:${s.store_phone.replace(/\s/g, '')}`} className="hover:text-primary-400">{s.store_phone}</a>
                </li>
              )}
              {s.store_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                  <a href={`mailto:${s.store_email}`} className="hover:text-primary-400 break-all">{s.store_email}</a>
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-primary-600 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              {['All Products', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Beauty'].map((item) => (
                <li key={item}>
                  <Link href={`/products?category=${item.toLowerCase().replace(/ & /g, '-')}`}
                    className="hover:text-primary-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['My Account', '/account'],
                ['My Orders', '/account/orders'],
                ['Wishlist', '/account/wishlist'],
                ['Sign In', '/auth/login'],
                ['Register', '/auth/register'],
              ].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Help Center', '/help'],
                ['Shipping Info', '/shipping'],
                ['Returns & Refunds', '/returns'],
                ['Track Order', '/account/orders'],
                ['Contact Us', '/contact'],
              ].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} {s.store_name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
