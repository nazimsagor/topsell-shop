const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendWelcomeEmail } = require('../utils/email');

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
  // Welcome email is intentionally not sent here — Resend free plan can only
  // deliver to verified addresses. Re-enable once a sending domain is verified.
  res.status(201).json({ subscriber: data, message: 'Subscribed successfully' });
});

exports.deleteSubscriber = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Subscriber not found' });
  res.json({ message: 'Subscriber deleted' });
});

exports.list = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ subscribers: data, total: data.length });
});
