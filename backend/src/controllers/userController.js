const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const lim  = parseInt(limit) || 20;
  const from = (parseInt(page) - 1) * lim;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
    .range(from, from + lim - 1);
  if (error) throw error;
  res.json(data);
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id, products(id, name, slug, price, old_price, image, badge)')
    .eq('user_id', req.user.id)
    .order('id', { ascending: false });
  if (error) throw error;
  res.json(data);
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { product_id } = req.body;

  const { data: existing } = await supabase
    .from('wishlist').select('id')
    .eq('user_id', req.user.id).eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    sb(await supabase.from('wishlist').delete().eq('id', existing.id));
    return res.json({ wishlisted: false });
  }

  sb(await supabase.from('wishlist')
    .insert({ user_id: req.user.id, product_id }));
  res.json({ wishlisted: true });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const [ordersRes, allOrdersRes, customersRes, productsRes, recentRes] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const revenue = (allOrdersRes.data || [])
    .reduce((s, o) => s + parseFloat(o.total), 0);

  res.json({
    stats: {
      orders:    ordersRes.count    || 0,
      revenue:   parseFloat(revenue.toFixed(2)),
      customers: customersRes.count || 0,
      products:  productsRes.count  || 0,
    },
    recentOrders: recentRes.data || [],
  });
});
