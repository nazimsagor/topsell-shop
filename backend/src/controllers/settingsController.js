const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

// Returns settings as a flat { key: value } map.
exports.getSettings = asyncHandler(async (req, res) => {
  const rows = sb(await supabase.from('site_settings').select('key, value'));
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  res.json(map);
});

// Body: { key1: value1, key2: value2, ... } — upserts each.
exports.updateSettings = asyncHandler(async (req, res) => {
  const entries = Object.entries(req.body || {});
  if (!entries.length) return res.status(400).json({ error: 'No settings provided' });
  const rows = entries.map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  sb(await supabase.from('site_settings').upsert(rows, { onConflict: 'key' }));
  res.json({ updated: entries.length });
});
