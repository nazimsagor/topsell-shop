'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useSiteSettings from '@/lib/useSiteSettings';
import api from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const settings = useSiteSettings();

  const CONTACT_METHODS = useMemo(() => {
    const phoneDigits = (settings.store_phone || '').replace(/\D/g, '');
    return [
      {
        icon: Phone,
        title: 'Call Us',
        value: settings.store_phone,
        href: `tel:${settings.store_phone}`,
        note: 'Sat–Thu, 9:00 AM – 9:00 PM',
        color: 'bg-red-50 text-red-600',
      },
      {
        icon: Mail,
        title: 'Email Us',
        value: settings.store_email,
        href: `mailto:${settings.store_email}`,
        note: 'We reply within 24 hours',
        color: 'bg-blue-50 text-blue-600',
      },
      {
        icon: MessageCircle,
        title: 'WhatsApp',
        value: settings.store_phone,
        href: phoneDigits ? `https://wa.me/${phoneDigits}` : '#',
        note: 'Fastest way to reach us',
        color: 'bg-green-50 text-green-600',
      },
    ];
  }, [settings.store_phone, settings.store_email]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent! We’ll get back to you soon.');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white mb-4">
            <MessageCircle className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            We&apos;d love to hear from you. Our team is here to answer your questions
            about orders, products, shipping, or anything else.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Quick contact tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONTACT_METHODS.map(({ icon: Icon, title, value, href, note, color }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-red-300 hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
              <p className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors break-all">
                {value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{note}</p>
            </a>
          ))}
        </section>

        {/* Form + info */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-sm text-gray-500 mb-6">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={onChange}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={onChange}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={onChange}
                    placeholder="How can we help?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={onChange}
                    placeholder="Tell us more about your question or concern..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send Message'}
                </button>

                {submitted && (
                  <p className="text-green-600 text-sm font-semibold mt-2">
                    ✓ Thanks! Your message has been sent. We&apos;ll get back to you soon.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Address + hours */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Our Office</h3>
              </div>
              <address className="not-italic text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {settings.store_name}{'\n'}
                {settings.store_address}
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.store_address || 'Bangladesh')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline mt-3"
              >
                View on Google Maps →
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Business Hours</h3>
              </div>
              <dl className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Saturday – Thursday</dt>
                  <dd className="font-semibold text-gray-900">9:00 AM – 9:00 PM</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Friday</dt>
                  <dd className="font-semibold text-gray-900">2:00 PM – 9:00 PM</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Public Holidays</dt>
                  <dd className="font-semibold text-gray-500">Closed</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-900 text-white rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3">Follow Us</h3>
              <p className="text-gray-300 text-sm mb-4">
                Stay updated with the latest products, offers, and news.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://facebook.com/topsellshop"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/topsellshop"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://wa.me/8801797515010"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <iframe
            title="TopSell Shop Location"
            src="https://www.google.com/maps?q=Banani+Dhaka+1213+Bangladesh&output=embed"
            className="w-full h-80 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        {/* FAQ link */}
        <section className="text-center bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Looking for quick answers?</h3>
          <p className="text-gray-600 text-sm mb-5 max-w-md mx-auto">
            Check our Help Center for frequently asked questions about orders,
            shipping, returns and more.
          </p>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            Visit Help Center
          </Link>
        </section>
      </div>
    </div>
  );
}
