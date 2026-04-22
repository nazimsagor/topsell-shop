'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  CreditCard,
  Smartphone,
  Wallet,
  Truck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import { ordersApi } from '../../lib/api';

const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const PAYMENT_METHODS = [
  { id: 'card',             label: 'Credit/Debit Card', icon: CreditCard },
  { id: 'bkash',            label: 'bKash',             icon: Smartphone },
  { id: 'cash_on_delivery', label: 'Cash on Delivery',  icon: Wallet },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartId, subtotal, clearCart } = useCartStore();
  const { user, loading: authLoading } = useAuthStore();

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: user?.name || '',
      phone: '',
      street: '',
      street2: '',
      city: '',
      district: '',
      postal_code: '',
      country: 'Bangladesh',
      card_number: '',
      card_expiry: '',
      card_cvv: '',
      card_name: '',
      bkash_phone: '',
    },
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  const sub = parseFloat(subtotal) || 0;
  const shipping = shippingMethod === 'express' ? 8 : sub >= 50 ? 0 : 3;
  const tax = +(sub * 0.08).toFixed(2);
  const total = +(sub + shipping + tax).toFixed(2);

  const cardNumber = watch('card_number');
  const cardExpiry = watch('card_expiry');

  // --- Guards -------------------------------------------------------------

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
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
        <Link href="/products" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // --- Submit -------------------------------------------------------------

  const onPlaceOrder = async (data) => {
    setSubmitting(true);
    try {
      const paymentDetails =
        paymentMethod === 'card'
          ? {
              card_last4: data.card_number.replace(/\s/g, '').slice(-4),
              card_name: data.card_name,
              card_expiry: data.card_expiry,
            }
          : paymentMethod === 'bkash'
            ? { bkash_phone: data.bkash_phone }
            : {};

      const { data: order } = await ordersApi.create({
        cart_id: cartId,
        shipping_address: {
          full_name: data.full_name,
          phone: data.phone,
          street: data.street,
          street2: data.street2 || undefined,
          city: data.city,
          district: data.district,
          postal_code: data.postal_code,
          country: data.country,
          shipping_method: shippingMethod,
        },
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        coupon_code: couponCode.trim() || undefined,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      setPlacedOrder(order);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onPlaceOrder)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT: shipping + payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping address */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>

            <div>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                placeholder="Full Name"
                className={inputCls}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <input
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: { value: /^[0-9+\-\s()]{7,}$/, message: 'Invalid phone number' },
                })}
                placeholder="Phone Number (e.g. +8801XXXXXXXXX)"
                className={inputCls}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <input
                {...register('street', { required: 'Address is required' })}
                placeholder="Address Line 1 (House, Road, Area)"
                className={inputCls}
              />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
            </div>

            <input
              {...register('street2')}
              placeholder="Address Line 2 (optional)"
              className={inputCls}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('city', { required: 'City is required' })}
                  placeholder="City (Dhaka, Chittagong...)"
                  className={inputCls}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <input
                  {...register('district', { required: 'District is required' })}
                  placeholder="District"
                  className={inputCls}
                />
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('postal_code', { required: 'Postal code is required' })}
                  placeholder="Postal Code"
                  className={inputCls}
                />
                {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>}
              </div>
              <input
                {...register('country')}
                placeholder="Country"
                className={inputCls}
                readOnly
              />
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
          </section>

          {/* Payment method */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>

            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="accent-red-600"
                  />
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                </label>
              ))}
            </div>

            {/* Card fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    {...register('card_number', {
                      required: paymentMethod === 'card' ? 'Card number is required' : false,
                      validate: (v) =>
                        paymentMethod !== 'card' ||
                        v.replace(/\s/g, '').length === 16 ||
                        'Card number must be 16 digits',
                    })}
                    value={cardNumber || ''}
                    onChange={(e) => setValue('card_number', formatCardNumber(e.target.value), { shouldValidate: true })}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    className={inputCls}
                  />
                  {errors.card_number && <p className="text-red-500 text-xs mt-1">{errors.card_number.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      {...register('card_expiry', {
                        required: paymentMethod === 'card' ? 'Expiry is required' : false,
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                          message: 'Format MM/YY',
                        },
                      })}
                      value={cardExpiry || ''}
                      onChange={(e) => setValue('card_expiry', formatExpiry(e.target.value), { shouldValidate: true })}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className={inputCls}
                    />
                    {errors.card_expiry && <p className="text-red-500 text-xs mt-1">{errors.card_expiry.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      {...register('card_cvv', {
                        required: paymentMethod === 'card' ? 'CVV is required' : false,
                        pattern: { value: /^\d{3,4}$/, message: '3 or 4 digits' },
                      })}
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={4}
                      className={inputCls}
                    />
                    {errors.card_cvv && <p className="text-red-500 text-xs mt-1">{errors.card_cvv.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    {...register('card_name', {
                      required: paymentMethod === 'card' ? 'Cardholder name is required' : false,
                    })}
                    placeholder="Name on card"
                    className={inputCls}
                  />
                  {errors.card_name && <p className="text-red-500 text-xs mt-1">{errors.card_name.message}</p>}
                </div>
              </div>
            )}

            {/* bKash */}
            {paymentMethod === 'bkash' && (
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
                <input
                  {...register('bkash_phone', {
                    required: paymentMethod === 'bkash' ? 'bKash number is required' : false,
                    pattern: { value: /^01[0-9]{9}$/, message: 'Must be 11 digits starting with 01' },
                  })}
                  placeholder="01XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={11}
                  className={inputCls}
                />
                {errors.bkash_phone && <p className="text-red-500 text-xs mt-1">{errors.bkash_phone.message}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  You will receive a bKash payment request on this number after placing the order.
                </p>
              </div>
            )}

            {/* COD */}
            {paymentMethod === 'cash_on_delivery' && (
              <div className="pt-2 border-t border-gray-100 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                Pay in cash to the delivery agent when your order arrives. Please keep the exact amount ready.
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: order summary */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 lg:sticky lg:top-24 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const p = item.products || {};
                const name = p.name || 'Product';
                const image = p.image || null;
                const price = parseFloat(p.price ?? item.price ?? 0) || 0;
                const qty = item.qty ?? item.quantity ?? 1;
                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{name}</p>
                      <p className="text-xs text-gray-500">Qty: {qty} × ${price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">${(price * qty).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Coupon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${sub.toFixed(2)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>Place Order • ${total.toFixed(2)}</>
              )}
            </button>
            <p className="text-xs text-center text-gray-500">
              By placing this order you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
