const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const { data, error } = await supabase
    .from('newsletters')
    .insert({ email })
    .select()
    .single();

  if (error) {
    // Postgres unique-violation surfaces as code 23505.
    if (error.code === '23505' || /duplicate/i.test(error.message)) {
      return res.status(409).json({ error: 'This email is already subscribed' });
    }
    throw error;
  }
  res.status(201).json({ subscriber: data, message: 'Subscribed successfully' });
});

exports.list = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ subscribers: data, total: data.length });
});
