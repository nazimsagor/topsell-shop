import Link from 'next/link';
import { Truck, Zap, MapPin, Clock, Package, ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Shipping Policy',
  description: 'Delivery times, charges, and coverage for TopSell Shop across Bangladesh.',
};

const OPTIONS = [
  {
    icon: Truck,
    name: 'Standard Delivery',
    eta: '3–5 business days',
    cost: '৳100–150 inside Dhaka, ৳150–200 outside Dhaka',
    note: 'Free on orders of ৳5,000 or above.',
  },
  {
    icon: Zap,
    name: 'Express Delivery',
    eta: '1–2 business days',
    cost: '৳250 (available in major cities)',
    note: 'Order before 2:00 PM for same-day dispatch.',
  },
];

const AREAS = [
  { area: 'Dhaka (within city)',          eta: '1–2 days' },
  { area: 'Dhaka (suburbs / outskirts)',  eta: '2–3 days' },
  { area: 'Chittagong, Sylhet, Rajshahi', eta: '2–4 days' },
  { area: 'Khulna, Barisal, Rangpur',     eta: '3–5 days' },
  { area: 'Remote districts & upazilas',  eta: '4–7 days' },
];

export default function ShippingPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white mb-4">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Shipping Policy</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fast, reliable delivery to every district of Bangladesh.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Options */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Delivery Options</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {OPTIONS.map(({ icon: Icon, name, eta, cost, note }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1"><Clock className="h-4 w-4" /> {eta}</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">{cost}</p>
                <p className="text-xs text-gray-500 mt-1">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage table */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Coverage & Estimated Times</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Area</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Standard ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {AREAS.map((row) => (
                  <tr key={row.area}>
                    <td className="px-4 py-3 text-gray-900 font-medium">{row.area}</td>
                    <td className="px-4 py-3 text-gray-600">{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Estimates are from the day your order is <strong>Confirmed</strong>. Weekends and public holidays are not counted.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">How Shipping Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Package,     title: 'Order Placed',   body: 'Your order is queued for dispatch as soon as payment is confirmed (COD is confirmed automatically).' },
              { icon: Truck,       title: 'On the Way',     body: 'We hand over to a trusted courier partner and send you a tracking update.' },
              { icon: ShieldCheck, title: 'Delivered Safe', body: 'Inspect the parcel on delivery. Report any issues within 48 hours.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <Icon className="h-6 w-6 text-red-600 mb-2" />
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Important notes */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-800 space-y-2">
              <p className="font-semibold text-gray-900">Please note</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Delivery times are estimates and may be affected by weather, traffic, or courier load.</li>
                <li>Cash on Delivery may be unavailable in certain remote areas — you will be notified at checkout.</li>
                <li>If no one is available at the delivery address, the courier will attempt redelivery within 24 hours.</li>
                <li>Please ensure your phone number is correct so the delivery agent can reach you.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center text-sm text-gray-600">
          Questions about a specific order?{' '}
          <Link href="/help" className="text-red-600 font-semibold hover:underline">Visit our Help Center</Link>
        </div>
      </div>
    </div>
  );
}
