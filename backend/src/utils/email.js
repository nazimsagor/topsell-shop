const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM        = process.env.EMAIL_FROM   || 'TopSell <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL  || 'nazimuddin112818@gmail.com';
const SITE_URL    = process.env.FRONTEND_URL || 'https://topsell.shop';

// Wraps Resend so missing API key (e.g. local dev without a key) does not
// crash the calling controller. Logs the failure and resolves with null.
async function send(payload) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', payload.to);
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, ...payload });
    if (error) {
      console.error('[email] send failed:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[email] send threw:', err);
    return null;
  }
}

const escape = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function shell(title, bodyHtml) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#dc2626;color:#fff;padding:18px 24px;border-radius:12px 12px 0 0;font-weight:800;font-size:20px">TopSell</div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px;line-height:1.55">
      <h1 style="margin:0 0 12px;font-size:20px">${escape(title)}</h1>
      ${bodyHtml}
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin:16px 0 0">
      &copy; ${new Date().getFullYear()} TopSell · Bangladesh
    </p>
  </div>
</body></html>`;
}

// ── Welcome email after a newsletter subscribe ────────────────────────────
exports.sendWelcomeEmail = (email) =>
  send({
    to: email,
    subject: 'Welcome to TopSell — you’re subscribed!',
    html: shell(
      'Welcome aboard 🎉',
      `<p>Thanks for subscribing to the TopSell newsletter.</p>
       <p>You’ll be the first to hear about new arrivals, flash sales, and exclusive Bangladesh-only deals.</p>
       <p style="margin:24px 0">
         <a href="${SITE_URL}" style="background:#dc2626;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;display:inline-block">Start shopping</a>
       </p>
       <p style="color:#6b7280;font-size:13px">If you didn’t sign up, you can ignore this email — we won’t contact you again.</p>`
    ),
  });

// ── Contact form forwarded to admin ───────────────────────────────────────
exports.sendContactEmail = (name, email, message, subject) =>
  send({
    to: ADMIN_EMAIL,
    reply_to: email,
    subject: subject ? `Contact: ${subject}` : `New contact form message from ${name}`,
    html: shell(
      'New contact form message',
      `<table style="border-collapse:collapse;width:100%;font-size:14px">
         <tr><td style="padding:6px 0;color:#6b7280;width:90px">Name</td><td>${escape(name)}</td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Email</td><td><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
         ${subject ? `<tr><td style="padding:6px 0;color:#6b7280">Subject</td><td>${escape(subject)}</td></tr>` : ''}
       </table>
       <hr style="border:0;border-top:1px solid #e5e7eb;margin:16px 0"/>
       <p style="white-space:pre-wrap;margin:0">${escape(message)}</p>`
    ),
  });

// ── Order confirmation to the buyer ───────────────────────────────────────
exports.sendOrderConfirmation = (order, userEmail) => {
  const items   = Array.isArray(order?.order_items) ? order.order_items : [];
  const orderNo = order?.order_number || `#${order?.id ?? ''}`;
  const total   = Number(order?.total || 0);
  const rows = items.map((it) => {
    const name = it?.products?.name || it?.product_name || 'Item';
    const qty  = Number(it?.quantity || 1);
    const sub  = Number(it?.price || 0) * qty;
    return `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${escape(name)} &times; ${qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">৳${Math.round(sub).toLocaleString('en-BD')}</td>
    </tr>`;
  }).join('');

  return send({
    to: userEmail,
    subject: `Your TopSell order ${orderNo} is confirmed`,
    html: shell(
      `Order ${orderNo} confirmed`,
      `<p>Thanks for shopping with TopSell — we’ve received your order and started preparing it.</p>
       <table style="border-collapse:collapse;width:100%;font-size:14px;margin:16px 0">
         ${rows || '<tr><td style="padding:8px 0;color:#9ca3af">No item details available.</td></tr>'}
         <tr>
           <td style="padding:12px 0 0;font-weight:700">Total</td>
           <td style="padding:12px 0 0;font-weight:700;text-align:right">৳${Math.round(total).toLocaleString('en-BD')}</td>
         </tr>
       </table>
       <p style="margin:24px 0">
         <a href="${SITE_URL}/account/orders" style="background:#dc2626;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;display:inline-block">Track your order</a>
       </p>
       <p style="color:#6b7280;font-size:13px">Questions? Reply to this email and our team will get back to you.</p>`
    ),
  });
};
