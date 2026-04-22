'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ChevronLeft, CreditCard, Check, Truck, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import { ordersApi } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartId, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const sub = parseFloat(subtotal) || 0;
  const shipping =
    shippingMethod === 'express' ? 8 : sub >= 50 ? 0 : 3;
  const tax = sub * 0.08;
  const total = sub + shipping + tax;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to Checkout</h2>
        <p className="text-gray-500 mb-6">You need to be signed in to complete your purchase</p>
        <Link href="/auth/login?redirect=/checkout" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl">Sign In</Link>
      </div>
    );
  }

  if (placedOrder) {
    const ref = placedOrder.order_number || (placedOrder.id ? String(placedOrder.id).slice(0, 8) : '');
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed! ✅</h1>
          <p className="text-gray-600 mb-1">Thank you for your purchase.</p>
          <p className="text-sm text-gray-500 mb-6">
            Order Number: <span className="font-mono font-semibold text-gray-900">#{ref}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl"
            >
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold px-6 py-3 rounded-xl"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/products" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl">Continue Shopping</Link>
      </div>
    );
  }

  const onShippingSubmit = (data) => {
    setShippingData(data);
    setStep(2);
  };

  const onPlaceOrder = async () => {
    setSubmitting(true);
    try {
      const { data } = await ordersApi.create({
        cart_id: cartId,
        shipping_address: { ...shippingData, shipping_method: shippingMethod },
        payment_method: 'card',
        coupon_code: couponCode.trim() || undefined,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      setPlacedOrder(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <div className="flex items-center gap-4 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              step > s ? 'bg-green-500 text-white' : step === s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className={`text-sm font-medium ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
              {s === 1 ? 'Shipping' : 'Payment'}
            </span>
            {s < 2 && <div className="w-16 h-0.5 bg-gray-200 ml-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <form onSubmit={handleSubmit(onShippingSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>

              <div>
                <input {...register('full_name', { required: true })} placeholder="Full Name" className={inputCls} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>

              <div>
                <input
                  {...register('phone', {
                    required: true,
                    pattern: { value: /^[0-9+\-\s()]{7,}$/, message: 'Invalid phone' },
                  })}
                  placeholder="Phone Number (e.g. +8801XXXXXXXXX)"
                  className={inputCls}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">Valid phone required</p>}
              </div>

              <div>
                <input {...register('street', { required: true })} placeholder="Address Line 1 (House, Road, Area)" className={inputCls} />
                {errors.street && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>

              <div>
                <input {...register('street2')} placeholder="Address Line 2 (optional)" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input {...register('city', { required: true })} placeholder="Dhaka, Chittagong, Sylhet..." className={inputCls} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <input {...register('district', { required: true })} placeholder="District" className={inputCls} />
                  {errors.district && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input {...register('postal_code', { required: true })} placeholder="Postal Code" className={inputCls} />
                <input {...register('country')} placeholder="Country" defaultValue="Bangladesh" className={inputCls} readOnly />
              </div>

              {/* Shipping method */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipping Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="ship"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-red-600"
                    />
                    <Truck className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Standard Delivery</p>
                      <p className="text-xs text-gray-500">3–5 business days</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {sub >= 50 ? <span className="text-green-600">Free</span> : '$3.00'}
                    </span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="ship"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-red-600"
                    />
                    <Zap className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Express Delivery</p>
                      <p className="text-xs text-gray-500">1–2 business days</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">$8.00</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">Continue to Payment</button>
            </form>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                <button onClick={() => setStep(1)} className="text-sm text-red-600 hover:underline">Edit Address</button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-gray-700 mb-1">Shipping to:</p>
                <p className="text-gray-600">{shippingData?.full_name} • {shippingData?.phone}</p>
                <p className="text-gray-600">
                  {shippingData?.street}{shippingData?.street2 ? `, ${shippingData.street2}` : ''}
                </p>
                <p className="text-gray-600">
                  {shippingData?.city}, {shippingData?.district} {shippingData?.postal_code}, {shippingData?.country}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code (optional)</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className={inputCls}
                  />
                  <button type="button" className="px-4 py-2 text-sm whitespace-nowrap border border-gray-300 rounded-lg hover:bg-gray-50">Apply</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Payment Method</h3>
                </div>
                <div className="space-y-2">
                  {['Credit/Debit Card', 'bKash', 'Cash on Delivery'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-red-400">
                      <input type="radio" name="payment" defaultChecked={method === 'Credit/Debit Card'} className="accent-red-600" />
                      <span className="text-sm font-medium text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={onPlaceOrder} disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? 'Placing Order...' : `Place Order • $${total.toFixed(2)}`}
              </button>
              <p className="text-xs text-center text-gray-500">
                By placing this order you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => {
              const p = item.products || {};
              const name = p.name || 'Product';
              const price = parseFloat(p.price ?? item.price ?? 0) || 0;
              const qty = item.qty ?? item.quantity ?? 1;
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{name} × {qty}</span>
                  <span className="font-medium flex-shrink-0">${(price * qty).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${sub.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
