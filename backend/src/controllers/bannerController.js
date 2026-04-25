const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

exports.listBanners = asyncHandler(async (req, res) => {
  const { active } = req.query;
  let q = supabase.from('banners').select('*').order('position').order('id');
  if (active === 'true') q = q.eq('is_active', true);
  res.json(sb(await q));
});

exports.createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, image, link_url, cta_label, position, is_active } = req.body;
  if (!image) return res.status(400).json({ error: 'image is required' });
  const banner = sb(await supabase.from('banners').insert({
    title: title || null,
    subtitle: subtitle || null,
    image,
    link_url: link_url || null,
    cta_label: cta_label || null,
    position: position ?? 0,
    is_active: is_active ?? true,
  }).select().single());
  res.status(201).json(banner);
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fields = ['title', 'subtitle', 'image', 'link_url', 'cta_label', 'position', 'is_active'];
  const updates = {};
  for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
  updates.updated_at = new Date().toISOString();
  const banner = sb(await supabase.from('banners').update(updates).eq('id', id).select().single());
  res.json(banner);
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sb(await supabase.from('banners').delete().eq('id', id));
  res.json({ deleted: true });
});
