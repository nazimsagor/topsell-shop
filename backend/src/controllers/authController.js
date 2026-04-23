const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const { data: existing } = await supabase
    .from('users').select('id').eq('email', email).maybeSingle();
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = sb(await supabase
    .from('users')
    .insert({ name, email, password: hash })
    .select('id, name, email, role, created_at')
    .single());

  res.status(201).json({ token: signToken(user.id), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  console.log('[login] attempt for email:', email);

  const { data: user, error: dbError } = await supabase
    .from('users')
    .select('id, name, email, password, role, created_at')
    .eq('email', email)
    .maybeSingle();

  console.log('[login] db error:', dbError?.message || null);
  console.log('[login] user found:', !!user);
  if (user) {
    console.log('[login] stored hash:', user.password);
  }

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  console.log('[login] bcrypt.compare result:', valid);

  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const { password: _, ...safeUser } = user;
  res.json({ token: signToken(user.id), user: safeUser });
});

// -------------------------------------------------------------------
// POST /api/auth/google
// Frontend completes Google OAuth through Supabase, then sends us the
// Supabase access_token. We verify it server-side, upsert the user in
// our own `users` table by email, and return an app JWT so the rest
// of the app (orders, cart, admin) keeps working unchanged.
// -------------------------------------------------------------------
exports.googleLogin = asyncHandler(async (req, res) => {
  const { access_token } = req.body || {};
  if (!access_token) return res.status(400).json({ error: 'access_token required' });

  // Verify the token against Supabase — getUser accepts any valid JWT.
  const { data: gUser, error: gErr } = await supabase.auth.getUser(access_token);
  if (gErr || !gUser?.user) {
    return res.status(401).json({ error: 'Invalid Google session' });
  }

  const email = gUser.user.email;
  if (!email) return res.status(400).json({ error: 'Google account has no email' });

  const meta = gUser.user.user_metadata || {};
  const name = meta.full_name || meta.name || email.split('@')[0];

  // Upsert our users row. Existing email → reuse row. New email → create
  // with a random password (OAuth users never sign in by password).
  let { data: user } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('email', email)
    .maybeSingle();

  if (!user) {
    const randomPw = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    user = sb(await supabase
      .from('users')
      .insert({ name, email, password: randomPw })
      .select('id, name, email, role, created_at')
      .single());
  }

  res.json({ token: signToken(user.id), user });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = sb(await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', req.user.id)
    .single());
  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nothing to update' });

  const user = sb(await supabase
    .from('users')
    .update({ name })
    .eq('id', req.user.id)
    .select('id, name, email, role, created_at')
    .single());
  res.json(user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'Invalid password data' });

  const { data: row } = await supabase
    .from('users').select('password').eq('id', req.user.id).single();
  const valid = await bcrypt.compare(currentPassword, row.password);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(newPassword, 10);
  sb(await supabase.from('users').update({ password: hash }).eq('id', req.user.id));
  res.json({ message: 'Password updated successfully' });
});
