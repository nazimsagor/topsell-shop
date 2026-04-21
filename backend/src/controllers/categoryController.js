const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = sb(await supabase
    .from('categories').select('*').order('name'));

  const { data: counts } = await supabase
    .from('products').select('category_id');

  const countMap = (counts || []).reduce((acc, p) => {
    acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    return acc;
  }, {});

  res.json(categories.map(c => ({ ...c, product_count: countMap[c.id] || 0 })));
});

exports.getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = sb(await supabase
    .from('categories').select('*').eq('slug', slug).maybeSingle());
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id);

  res.json({ ...category, product_count: count || 0 });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, slug, image, parent_id } = req.body;
  const category = sb(await supabase
    .from('categories')
    .insert({ name, slug, image: image || null, parent_id: parent_id || null })
    .select()
    .single());
  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, image, parent_id } = req.body;
  const updates = {};
  if (name      !== undefined) updates.name      = name;
  if (image     !== undefined) updates.image     = image;
  if (parent_id !== undefined) updates.parent_id = parent_id;

  if (!Object.keys(updates).length)
    return res.status(400).json({ error: 'No fields to update' });

  const category = sb(await supabase
    .from('categories').update(updates).eq('id', id).select().single());
  res.json(category);
});
