const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

function normaliseSlug(s = '') {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

exports.listPosts = asyncHandler(async (_req, res) => {
  const data = sb(await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, image_url, published_at')
    .order('published_at', { ascending: false }));
  res.json({ posts: data, total: data.length });
});

exports.getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = sb(await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle());
  if (!data) return res.status(404).json({ error: 'Post not found' });
  res.json(data);
});

exports.createPost = asyncHandler(async (req, res) => {
  const title    = String(req.body?.title    || '').trim();
  const content  = String(req.body?.content  || '').trim();
  let   slug     = String(req.body?.slug     || '').trim().toLowerCase();
  const excerpt  = String(req.body?.excerpt  || '').trim();
  const category = String(req.body?.category || '').trim();
  const image_url    = String(req.body?.image_url    || '').trim();
  const published_at = req.body?.published_at || new Date().toISOString();

  if (!title)   return res.status(400).json({ error: 'Title is required' });
  if (!content) return res.status(400).json({ error: 'Content is required' });

  if (!slug) slug = normaliseSlug(title);
  if (!SLUG_RE.test(slug)) {
    return res.status(400).json({ error: 'Slug must be lowercase letters, numbers and hyphens only' });
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      excerpt:  excerpt  || null,
      content,
      category: category || null,
      image_url:    image_url || null,
      published_at,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || /duplicate/i.test(error.message)) {
      return res.status(409).json({ error: 'A post with this slug already exists' });
    }
    throw error;
  }
  res.status(201).json(data);
});

exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  const fields = ['title', 'excerpt', 'content', 'category', 'image_url', 'published_at'];
  for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f] || null;

  if (req.body.slug !== undefined) {
    const slug = String(req.body.slug).trim().toLowerCase();
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({ error: 'Slug must be lowercase letters, numbers and hyphens only' });
    }
    updates.slug = slug;
  }
  if (updates.title === null) return res.status(400).json({ error: 'Title is required' });

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === '23505' || /duplicate/i.test(error.message)) {
      return res.status(409).json({ error: 'A post with this slug already exists' });
    }
    throw error;
  }
  if (!data) return res.status(404).json({ error: 'Post not found' });
  res.json(data);
});

exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Post not found' });
  res.json({ deleted: true });
});
