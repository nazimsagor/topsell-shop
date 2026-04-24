import Link from 'next/link';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Package,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';

export const metadata = {
  title: 'Returns & Refunds',
  description: 'Our 7-day return policy, eligibility, and refund timelines for TopSell Shop.',
};

const STEPS = [
  { icon: MessageCircle, title: 'Contact Us',    body: 'Email support@topsell.shop or WhatsApp us within 7 days of delivery, with your order number and a short description of the issue.' },
  { icon: Package,       title: 'Pack the Item', body: 'Pack the product in its original packaging with all accessories, tags, manuals, and freebies.' },
  { icon: RotateCcw,     title: 'Courier Pickup',body: 'We arrange a courier pickup from your address (free for damaged/wrong items; otherwise ৳100).' },
  { icon: CreditCard,    title: 'Refund Issued', body: 'Once we inspect and approve the return, your refund is issued within 3–7 business days.' },
];

export default function ReturnsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white mb-4">
            <RotateCcw className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Returns &amp; Refunds</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Not quite right? You have <strong>7 days</strong> from delivery to request a return.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Eligibility */}
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Eligible for Return</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex gap-2"><span className="text-green-600">✓</span> Product arrived damaged or defective</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Wrong item, size, or colour was delivered</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Item is unused, in original packaging with tags</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Request raised within 7 days of delivery</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Not Returnable</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex gap-2"><span className="text-red-600">✗</span> Innerwear, cosmetics, and personal care items</li>
              <li className="flex gap-2"><span className="text-red-600">✗</span> Perishable goods and groceries</li>
              <li className="flex gap-2"><span className="text-red-600">✗</span> Items marked "Final Sale" or "No Return"</li>
              <li className="flex gap-2"><span className="text-red-600">✗</span> Products damaged by misuse or normal wear</li>
              <li className="flex gap-2"><span className="text-red-600">✗</span> Requests made after the 7-day window</li>
            </ul>
          </div>
        </section>

        {/* How to return */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">How to Return an Item</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-5 relative">
                <span className="absolute top-3 right-4 text-3xl font-extrabold text-red-100 leading-none select-none">
                  {i + 1}
                </span>
                <Icon className="h-6 w-6 text-red-600 mb-2" />
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Refund timeline */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-red-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Refund Timeline</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Original Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Refund Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Typical Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Card (SSLCommerz)</td>
                  <td className="px-4 py-3 text-gray-700">Back to the original card</td>
                  <td className="px-4 py-3 text-gray-600">5–7 business days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">bKash / Nagad / Rocket</td>
                  <td className="px-4 py-3 text-gray-700">Back to the same mobile wallet</td>
                  <td className="px-4 py-3 text-gray-600">1–3 business days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Cash on Delivery</td>
                  <td className="px-4 py-3 text-gray-700">bKash / Nagad / bank transfer (you choose)</td>
                  <td className="px-4 py-3 text-gray-600">3–5 business days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Exchange */}
        <section className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Want an Exchange Instead?</h2>
          <p className="text-gray-300 text-sm mb-4">
            For wrong size or colour, we can swap it for the right one (subject to stock). Just mention "Exchange" when
            you contact us — no extra shipping charge for the first exchange.
          </p>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            Contact Support
          </Link>
        </section>

        {/* Notes */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-800 space-y-2">
              <p className="font-semibold text-gray-900">Good to know</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Shipping charges on the original order are non-refundable unless the return is due to our error.</li>
                <li>If a coupon was applied, the refund amount is calculated on the actual amount you paid.</li>
                <li>Return pickups are attempted up to 2 times; please keep the parcel ready.</li>
                <li>For damaged or wrong items, please share a photo when raising the request to speed things up.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
