const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

exports.createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shipping_address, payment_method } = req.body || {};
  const rawCoupon = (req.body?.coupon_code || '').trim();

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

  let total = parseFloat(
    cartItems.reduce((s, i) => s + i.products.price * i.qty, 0).toFixed(2)
  );

  // Validate coupon only if provided. Empty/whitespace is ignored silently.
  let validCoupon = null;
  let discount = 0;
  if (rawCoupon) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('code, discount_type, discount_value, active')
      .eq('code', rawCoupon)
      .maybeSingle();

    if (coupon && coupon.active !== false) {
      validCoupon = coupon.code;
      discount =
        coupon.discount_type === 'percent'
          ? +(total * (coupon.discount_value / 100)).toFixed(2)
          : +coupon.discount_value;
      total = Math.max(0, +(total - discount).toFixed(2));
    }
    // Invalid or missing coupon: ignore silently instead of erroring.
  }

  const order = sb(await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      shipping_address: shipping_address || null,
      payment_method: payment_method || null,
      coupon_code: validCoupon,
    })
    .select()
    .single());

  sb(await supabase.from('order_items').insert(
    cartItems.map(item => ({
      order_id:   order.id,
      product_id: item.product_id,
      qty:        item.qty,
      price:      item.products.price,
    }))
  ));

  await Promise.all(
    cartItems.map(item =>
      supabase.from('products')
        .update({ stock: item.products.stock - item.qty })
        .eq('id', item.product_id)
    )
  );

  await supabase.from('cart').delete().eq('user_id', userId);

  res.status(201).json(order);
});

exports.getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const lim  = parseInt(limit) || 10;
  const from = (parseInt(page) - 1) * lim;
  const to   = from + lim - 1;

  const isAdmin = req.user.role === 'admin';
  let query = supabase
    .from('orders')
    .select('*, users(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (!isAdmin) query = query.eq('user_id', req.user.id);
  if (status)   query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, users(name, email), order_items(id, qty, price, products(name, image))')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role !== 'admin' && order.user_id !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });
  res.json(order);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const order = sb(await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single());
  res.json(order);
});
