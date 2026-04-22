const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Date.now();
}

exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, category, search,
    sort = 'id', order = 'desc',
    min_price, max_price, featured,
  } = req.query;

  const lim  = Math.min(parseInt(limit) || 12, 100);
  const pg   = parseInt(page) || 1;
  const from = (pg - 1) * lim;
  const to   = from + lim - 1;

  let categoryId = null;
  if (category) {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', category).maybeSingle();
    if (!cat)
      return res.json({ products: [], pagination: { total: 0, page: pg, limit: lim, pages: 0 } });
    categoryId = cat.id;
  }

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' });

  if (categoryId)          query = query.eq('category_id', categoryId);
  if (search)              query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (min_price)           query = query.gte('price', parseFloat(min_price));
  if (max_price)           query = query.lte('price', parseFloat(max_price));
  if (featured === 'true') query = query.not('badge', 'is', null);

  const allowedSorts = { price: 'price', name: 'name', id: 'id', stock: 'stock' };
  const sortCol = allowedSorts[sort] || 'id';
  query = query.order(sortCol, { ascending: order === 'asc' }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  res.json({
    products: data,
    pagination: { total: count, page: pg, limit: lim, pages: Math.ceil(count / lim) },
  });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumericId = /^\d+$/.test(slug);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const col = isNumericId || isUuid ? 'id' : 'slug';
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq(col, slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, slug, description, price, old_price, stock, category_id, image, badge } = req.body;
  const product = sb(await supabase
    .from('products')
    .insert({
      name,
      slug: slug || slugify(name),
      description,
      price: parseFloat(price),
      old_price: old_price ? parseFloat(old_price) : null,
      stock: parseInt(stock) || 0,
      category_id: category_id || null,
      image: image || null,
      badge: badge || null,
    })
    .select()
    .single());
  res.status(201).json(product);
});

const PRODUCT_COLUMNS = new Set([
  'name', 'slug', 'description', 'price', 'old_price',
  'stock', 'category_id', 'image', 'badge',
]);

exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { id: _, ...rest } = req.body;
  // Drop any fields that don't exist on the products table.
  const fields = Object.fromEntries(
    Object.entries(rest).filter(([k]) => PRODUCT_COLUMNS.has(k))
  );
  if (!Object.keys(fields).length)
    return res.status(400).json({ error: 'No valid fields to update' });

  const product = sb(await supabase
    .from('products')
    .update(fields)
    .eq('id', id)
    .select()
    .single());
  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sb(await supabase.from('products').delete().eq('id', id));
  res.json({ message: 'Product deleted' });
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .not('badge', 'is', null)
    .order('id', { ascending: false })
    .limit(8);
  if (error) throw error;
  res.json(data);
});
