const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

exports.getCart = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('cart')
    .select('id, qty, products(id, name, slug, price, old_price, image, stock)')
    .eq('user_id', req.user.id);
  if (error) throw error;

  const subtotal = parseFloat(
    data.reduce((s, i) => s + i.products.price * i.qty, 0).toFixed(2)
  );
  res.json({ items: data, subtotal });
});

exports.addItem = asyncHandler(async (req, res) => {
  const { product_id, qty = 1 } = req.body;

  const { data: product } = await supabase
    .from('products').select('price, stock').eq('id', product_id).maybeSingle();
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < qty) return res.status(400).json({ error: 'Insufficient stock' });

  const { data: existing } = await supabase
    .from('cart').select('id, qty')
    .eq('user_id', req.user.id).eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    sb(await supabase.from('cart')
      .update({ qty: existing.qty + qty }).eq('id', existing.id));
  } else {
    sb(await supabase.from('cart')
      .insert({ user_id: req.user.id, product_id, qty }));
  }
  res.json({ message: 'Item added to cart' });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (qty < 1) {
    sb(await supabase.from('cart').delete().eq('id', id).eq('user_id', req.user.id));
    return res.json({ message: 'Item removed' });
  }
  sb(await supabase.from('cart').update({ qty }).eq('id', id).eq('user_id', req.user.id));
  res.json({ message: 'Cart updated' });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sb(await supabase.from('cart').delete().eq('id', id).eq('user_id', req.user.id));
  res.json({ message: 'Item removed' });
});

exports.clearCart = asyncHandler(async (req, res) => {
  sb(await supabase.from('cart').delete().eq('user_id', req.user.id));
  res.json({ message: 'Cart cleared' });
});
