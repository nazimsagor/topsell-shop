'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ChevronLeft, CreditCard, Check } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartId, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to Checkout</h2>
        <p className="text-gray-500 mb-6">You need to be signed in to complete your purchase</p>
        <Link href="/auth/login?redirect=/checkout" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
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
        shipping_address: shippingData,
        payment_method: 'card',
        coupon_code: couponCode || undefined,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      router.push(`/account/orders/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <div className="flex items-center gap-4 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              step > s ? 'bg-green-500 text-white' : step === s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
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
            <form onSubmit={handleSubmit(onShippingSubmit)} className="card p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              <input {...register('full_name', { required: true })} placeholder="Full Name" className="input" />
              {errors.full_name && <p className="text-red-500 text-xs">Required</p>}

              <input {...register('street', { required: true })} placeholder="Street Address" className="input" />
              {errors.street && <p className="text-red-500 text-xs">Required</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input {...register('city', { required: true })} placeholder="City" className="input" />
                  {errors.city && <p className="text-red-500 text-xs">Required</p>}
                </div>
                <div>
                  <input {...register('state', { required: true })} placeholder="State" className="input" />
                  {errors.state && <p className="text-red-500 text-xs">Required</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input {...register('zip', { required: true })} placeholder="ZIP Code" className="input" />
                <input {...register('country')} placeholder="Country" defaultValue="US" className="input" />
              </div>

              <button type="submit" className="btn-primary w-full">Continue to Payment</button>
            </form>
          )}

          {step === 2 && (
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline">Edit Address</button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-gray-700 mb-1">Shipping to:</p>
                <p className="text-gray-600">{shippingData?.full_name}</p>
                <p className="text-gray-600">{shippingData?.street}, {shippingData?.city}, {shippingData?.state} {shippingData?.zip}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code (optional)</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input"
                  />
                  <button type="button" className="btn-secondary px-4 py-2 text-sm whitespace-nowrap">Apply</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Payment Method</h3>
                </div>
                <div className="space-y-2">
                  {['Credit/Debit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-primary-400">
                      <input type="radio" name="payment" defaultChecked={method === 'Credit/Debit Card'} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={onPlaceOrder} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? 'Placing Order...' : `Place Order • $${total.toFixed(2)}`}
              </button>
              <p className="text-xs text-center text-gray-500">
                By placing this order you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                <span className="font-medium flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
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
