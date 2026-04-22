const SSLCommerzPayment = require('sslcommerz-lts');
const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const STORE_ID   = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PWD  = process.env.SSLCOMMERZ_STORE_PASSWORD;
const IS_LIVE    = String(process.env.SSLCOMMERZ_IS_LIVE) === 'true';
const BACKEND    = process.env.BACKEND_URL  || 'http://localhost:5000';
const FRONTEND   = process.env.FRONTEND_URL || 'http://localhost:3000';

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

function ensureConfigured(res) {
  if (!STORE_ID || !STORE_PWD) {
    res.status(500).json({
      error: 'SSLCommerz is not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD in backend/.env.',
    });
    return false;
  }
  return true;
}

// -------------------------------------------------------------------
// POST /api/payment/init
// Create a pending order, initialise SSLCommerz payment, return gateway URL.
// -------------------------------------------------------------------
exports.initPayment = asyncHandler(async (req, res) => {
  if (!ensureConfigured(res)) return;

  const userId = req.user.id;
  const { shipping_address } = req.body || {};
  if (!shipping_address) return res.status(400).json({ error: 'shipping_address required' });

  // Load cart with product details
  const { data: cartItems, error: cartErr } = await supabase
    .from('cart')
    .select('id, qty, product_id, products(id, name, price, stock)')
    .eq('user_id', userId);
  if (cartErr) throw cartErr;
  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  for (const item of cartItems) {
    if (item.products.stock < item.qty)
      return res.status(400).json({ error: `Insufficient stock for "${item.products.name}"` });
  }

  const subtotal = +(cartItems.reduce((s, i) => s + i.products.price * i.qty, 0)).toFixed(2);
  const shippingMethod = shipping_address?.shipping_method;
  const shippingCost = shippingMethod === 'express' ? 8 : subtotal >= 50 ? 0 : 3;
  const tax   = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shippingCost + tax).toFixed(2);

  // Create order with status=pending, payment_method=sslcommerz
  const order = sb(await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      subtotal,
      tax,
      shipping_cost: shippingCost,
      status: 'pending',
      payment_method: 'sslcommerz',
      shipping_address: shipping_address || null,
    })
    .select()
    .single());

  sb(await supabase.from('order_items').insert(
    cartItems.map((item) => ({
      order_id:   order.id,
      product_id: item.product_id,
      qty:        item.qty,
      price:      item.products.price,
    }))
  ));

  // Get user for billing info
  const { data: userRow } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', userId)
    .maybeSingle();

  const addr = shipping_address;
  const tranId = `ORDER_${order.id}_${Date.now()}`;

  const data = {
    total_amount: total,
    currency: 'BDT',
    tran_id: tranId,
    success_url: `${BACKEND}/api/payment/success`,
    fail_url:    `${BACKEND}/api/payment/fail`,
    cancel_url:  `${BACKEND}/api/payment/cancel`,
    ipn_url:     `${BACKEND}/api/payment/ipn`,

    shipping_method: shippingMethod === 'express' ? 'Courier' : 'YES',
    product_name:    `Order #${order.id}`,
    product_category: 'General',
    product_profile: 'general',

    cus_name:     addr.full_name || userRow?.name  || 'Customer',
    cus_email:    userRow?.email || 'noemail@topsell.shop',
    cus_add1:     addr.street  || 'N/A',
    cus_add2:     addr.street2 || '',
    cus_city:     addr.city    || 'Dhaka',
    cus_state:    addr.district || addr.state || 'Dhaka',
    cus_postcode: addr.postal_code || '1200',
    cus_country:  addr.country || 'Bangladesh',
    cus_phone:    addr.phone || '0',
    cus_fax:      addr.phone || '0',

    ship_name:     addr.full_name || userRow?.name || 'Customer',
    ship_add1:     addr.street || 'N/A',
    ship_add2:     addr.street2 || '',
    ship_city:     addr.city || 'Dhaka',
    ship_state:    addr.district || addr.state || 'Dhaka',
    ship_postcode: addr.postal_code || '1200',
    ship_country:  addr.country || 'Bangladesh',

    value_a: String(order.id),          // pass through for callback
    value_b: String(userId),
  };

  // Persist tran_id + shipping_address as JSON in order (shipping_address column
  // already exists — we store the whole payload there plus tran_id).
  await supabase.from('orders').update({
    shipping_address: { ...shipping_address, tran_id: tranId },
  }).eq('id', order.id);

  const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PWD, IS_LIVE);
  const apiResponse = await sslcz.init(data);

  if (!apiResponse?.GatewayPageURL) {
    return res.status(502).json({
      error: 'SSLCommerz failed to return a gateway URL',
      details: apiResponse,
    });
  }

  res.json({
    url: apiResponse.GatewayPageURL,
    orderId: order.id,
    tran_id: tranId,
  });
});

// -------------------------------------------------------------------
// SSLCommerz callbacks (POST form-encoded, browser follows our redirect)
// -------------------------------------------------------------------
async function getOrderFromCallback(body) {
  const orderId = body.value_a || (body.tran_id || '').match(/ORDER_(\d+)_/)?.[1];
  if (!orderId) return null;
  const { data } = await supabase
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .maybeSingle();
  return data;
}

exports.paymentSuccess = asyncHandler(async (req, res) => {
  const order = await getOrderFromCallback(req.body);
  if (!order) return res.redirect(`${FRONTEND}/checkout?error=order_not_found`);

  // Validate with SSLCommerz if configured
  try {
    if (STORE_ID && STORE_PWD && req.body.val_id) {
      const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PWD, IS_LIVE);
      const validation = await sslcz.validate({ val_id: req.body.val_id });
      if (!['VALID', 'VALIDATED'].includes(validation?.status)) {
        return res.redirect(`${FRONTEND}/checkout?error=payment_invalid`);
      }
    }
  } catch (e) {
    // validation failed — treat as failure, but don't 500 the redirect
    return res.redirect(`${FRONTEND}/checkout?error=payment_invalid`);
  }

  // Mark paid, decrement stock, clear cart.
  await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);

  // Decrement stock from this order's items
  const { data: items } = await supabase
    .from('order_items')
    .select('qty, product_id, products(stock)')
    .eq('order_id', order.id);

  if (items?.length) {
    await Promise.all(items.map((it) =>
      supabase
        .from('products')
        .update({ stock: (it.products?.stock ?? 0) - it.qty })
        .eq('id', it.product_id)
    ));
  }

  await supabase.from('cart').delete().eq('user_id', order.user_id);

  res.redirect(`${FRONTEND}/order-success?orderId=${order.id}`);
});

exports.paymentFail = asyncHandler(async (req, res) => {
  const order = await getOrderFromCallback(req.body);
  if (order) await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
  res.redirect(`${FRONTEND}/checkout?error=payment_failed`);
});

exports.paymentCancel = asyncHandler(async (req, res) => {
  const order = await getOrderFromCallback(req.body);
  if (order) await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
  res.redirect(`${FRONTEND}/checkout?error=payment_cancelled`);
});

exports.paymentIpn = asyncHandler(async (req, res) => {
  // IPN is a server-to-server notification. Just acknowledge.
  const order = await getOrderFromCallback(req.body);
  if (order && req.body.status === 'VALID') {
    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
  }
  res.status(200).send('OK');
});
