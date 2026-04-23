const supabase = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function sb({ data, error }) {
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data;
}

// -------------------------------------------------------------------
// Shared evaluation helper — used by both /validate and the order flow.
// Returns { ok, discount, reason }. Discount is capped at the subtotal.
// -------------------------------------------------------------------
function evaluateCoupon(coupon, subtotal) {
  const sub = Number(subtotal) || 0;
  if (!coupon)                             return { ok: false, reason: 'Coupon code not found' };
  if (coupon.is_active === false)          return { ok: false, reason: 'Coupon is inactive' };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
                                           return { ok: false, reason: 'Coupon has expired' };
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
                                           return { ok: false, reason: 'Coupon usage limit reached' };
  if (Number(coupon.min_order_amount) > 0 && sub < Number(coupon.min_order_amount))
    return {
      ok: false,
      reason: `Minimum order amount for this coupon is $${Number(coupon.min_order_amount).toFixed(2)}`,
    };

  const raw = coupon.discount_type === 'percent'
    ? sub * (Number(coupon.discount_value) / 100)
    : Number(coupon.discount_value);
  const discount = +Math.min(raw, sub).toFixed(2);

  return { ok: true, discount, coupon };
}

async function findCouponByCode(code) {
  if (!code) return null;
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code.trim())
    .maybeSingle();
  return data;
}

// Atomic increment — falls back to read-then-write if the RPC is missing.
async function incrementUsage(code) {
  if (!code) return;
  const { error: rpcErr } = await supabase.rpc('increment_coupon_usage', { p_code: code });
  if (!rpcErr) return;
  const coupon = await findCouponByCode(code);
  if (coupon) {
    await supabase
      .from('coupons')
      .update({ used_count: (coupon.used_count ?? 0) + 1 })
      .eq('id', coupon.id);
  }
}

// -------------------------------------------------------------------
// POST /api/coupons/validate   (authenticated user)
//   body: { code, subtotal }
// -------------------------------------------------------------------
exports.validateCoupon = asyncHandler(async (req, res) => {
  const rawCode = String(req.body?.code || '').trim();
  if (!rawCode) return res.status(400).json({ error: 'Coupon code is required' });

  const subtotal = Number(req.body?.subtotal) || 0;
  const coupon = await findCouponByCode(rawCode);
  const result = evaluateCoupon(coupon, subtotal);

  if (!result.ok) return res.status(400).json({ error: result.reason });

  res.json({
    code:           coupon.code,
    discount_type:  coupon.discount_type,
    discount_value: Number(coupon.discount_value),
    discount:       result.discount,
    message:        `Coupon applied: ${coupon.discount_type === 'percent'
      ? `${coupon.discount_value}% off`
      : `$${Number(coupon.discount_value).toFixed(2)} off`}`,
  });
});

// -------------------------------------------------------------------
// Admin CRUD
// -------------------------------------------------------------------
exports.listCoupons = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
});

exports.getCoupon = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Coupon not found' });
  res.json(data);
});

const COUPON_COLUMNS = new Set([
  'code', 'discount_type', 'discount_value',
  'min_order_amount', 'max_uses', 'used_count',
  'expires_at', 'is_active',
]);

function sanitize(body, { requireCode = false } = {}) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (!COUPON_COLUMNS.has(k)) continue;
    out[k] = v;
  }

  if (out.code != null) out.code = String(out.code).trim().toUpperCase();
  if (requireCode && !out.code) {
    throw Object.assign(new Error('Coupon code is required'), { status: 400 });
  }

  if (out.discount_type && !['percent', 'fixed'].includes(out.discount_type)) {
    throw Object.assign(new Error('discount_type must be "percent" or "fixed"'), { status: 400 });
  }

  if (out.discount_value != null) {
    const n = Number(out.discount_value);
    if (!Number.isFinite(n) || n < 0) {
      throw Object.assign(new Error('discount_value must be a non-negative number'), { status: 400 });
    }
    out.discount_value = n;
  }

  if (out.min_order_amount != null && out.min_order_amount !== '') {
    out.min_order_amount = Number(out.min_order_amount) || 0;
  } else if (out.min_order_amount === '') {
    out.min_order_amount = 0;
  }

  if (out.max_uses === '' || out.max_uses == null) {
    delete out.max_uses;
  } else {
    const n = parseInt(out.max_uses, 10);
    out.max_uses = Number.isFinite(n) ? n : null;
  }

  if (out.expires_at === '' || out.expires_at == null) {
    out.expires_at = null;
  }

  if (out.is_active != null) out.is_active = Boolean(out.is_active);

  return out;
}

exports.createCoupon = asyncHandler(async (req, res) => {
  const payload = sanitize(req.body, { requireCode: true });
  if (!payload.discount_type) payload.discount_type = 'percent';
  if (payload.discount_value == null) {
    return res.status(400).json({ error: 'discount_value is required' });
  }

  const coupon = sb(await supabase
    .from('coupons')
    .insert(payload)
    .select()
    .single());
  res.status(201).json(coupon);
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const payload = sanitize(req.body);
  if (!Object.keys(payload).length) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const coupon = sb(await supabase
    .from('coupons')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single());
  res.json(coupon);
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  sb(await supabase.from('coupons').delete().eq('id', req.params.id));
  res.json({ message: 'Coupon deleted' });
});

// Exposed for orderController so both paths share identical validation logic.
exports._internal = { evaluateCoupon, findCouponByCode, incrementUsage };
