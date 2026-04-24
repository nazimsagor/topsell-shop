'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  Search,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  User,
} from 'lucide-react';

export const dynamic = 'force-static';

const CATEGORIES = [
  { icon: Package,    label: 'Orders',   href: '#orders' },
  { icon: Truck,      label: 'Shipping', href: '/shipping' },
  { icon: RotateCcw,  label: 'Returns',  href: '/returns' },
  { icon: CreditCard, label: 'Payment',  href: '#payment' },
  { icon: User,       label: 'Account',  href: '#account' },
];

const FAQS = [
  {
    id: 'orders',
    title: 'Orders',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse our catalogue, add items to your cart, click Checkout, enter your delivery address, choose a payment method, and place the order. You will receive a confirmation immediately.',
      },
      {
        q: 'Can I change or cancel my order after placing it?',
        a: 'Orders that are still in the "Pending" or "Confirmed" status can be cancelled from your Account → Orders page. Once an order has been shipped, it can no longer be cancelled but may be returned after delivery.',
      },
      {
        q: 'How do I track my order?',
        a: 'Sign in, open Account → Orders, and click on any order to see its current status. Order statuses progress from Pending → Confirmed → Processing → Shipped → Delivered.',
      },
      {
        q: 'What does each order status mean?',
        a: 'Pending = we received your order, Confirmed = payment confirmed, Processing = we are packing it, Shipped = on the way with a courier, Delivered = received by you, Cancelled / Refunded are self-explanatory.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'SSLCommerz (Visa, Mastercard, AmEx, bKash, Nagad, Rocket, and every supported Bangladeshi bank) and Cash on Delivery. You choose at checkout.',
      },
      {
        q: 'Is online payment secure?',
        a: 'Yes. All online payments are processed through SSLCommerz, which is PCI-DSS compliant. We never see or store your card details — they go directly to the gateway over an encrypted connection.',
      },
      {
        q: 'Do you accept Cash on Delivery?',
        a: 'Yes, Cash on Delivery is available across Bangladesh. Please keep the exact amount ready for the delivery agent.',
      },
      {
        q: 'How do I apply a coupon?',
        a: 'On the checkout page, enter your coupon code in the "Coupon Code" field in the order summary and click Apply. The discount will be reflected in your total immediately.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" in the header and register with your email and password, or use Continue with Google for a one-click sign-in.',
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'On the login page, click "Forgot password" (coming soon). In the meantime, contact support@topsell.shop and we will help you reset it.',
      },
      {
        q: 'Can I save multiple delivery addresses?',
        a: 'Yes. Open Account → Addresses to add, edit, or remove saved addresses. You can pick any saved address at checkout.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm sm:text-base font-semibold text-gray-900">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white mb-4">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">How can we help?</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Find quick answers to common questions, or get in touch with our support team.
          </p>
          <div className="relative max-w-lg mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search for help..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CATEGORIES.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:border-red-300 hover:shadow-md transition"
            >
              <Icon className="h-6 w-6 text-red-600" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{label}</span>
            </Link>
          ))}
        </div>

        {/* FAQ sections */}
        {FAQS.map((section) => (
          <section key={section.id} id={section.id} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Frequently asked questions about {section.title.toLowerCase()}.</p>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, idx) => (
                <FAQItem key={idx} {...item} />
              ))}
            </div>
          </section>
        ))}

        {/* Contact */}
        <section className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Still need help?</h2>
              <p className="text-gray-300 text-sm">Our team replies within 24 hours on working days.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@topsell.shop"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
              >
                <Mail className="h-4 w-4" /> Email Us
              </a>
              <a
                href="tel:+8801700000000"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
              >
                <Phone className="h-4 w-4" /> Call Us
              </a>
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
