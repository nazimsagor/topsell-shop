const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /products/:id/reviews
// Public — returns list + aggregate { average, count }.
exports.listReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, users(name)')
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const reviews = (data || []).map((r) => ({
    id:         r.id,
    rating:     r.rating,
    comment:    r.comment,
    created_at: r.created_at,
    user_name:  r.users?.name || 'Anonymous',
  }));

  const count   = reviews.length;
  const average = count
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : 0;

  res.json({ reviews, summary: { average, count } });
});

// POST /products/:id/reviews
// Auth required. Upserts so a user can revise their own review.
exports.addReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const ratingInt = parseInt(rating, 10);
  if (!Number.isFinite(ratingInt) || ratingInt < 1 || ratingInt > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });

  // Make sure the product exists so we return a clean 404 instead of an FK error.
  const { data: product } = await supabase
    .from('products').select('id').eq('id', id).maybeSingle();
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      {
        product_id: id,
        user_id:    req.user.id,
        rating:     ratingInt,
        comment:    (comment || '').trim() || null,
      },
      { onConflict: 'product_id,user_id' }
    )
    .select('id, rating, comment, created_at')
    .single();

  if (error) throw error;
  res.status(201).json({
    ...data,
    user_name: req.user.name,
  });
});
