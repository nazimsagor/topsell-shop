const { asyncHandler } = require('../middleware/errorHandler');
const { sendContactEmail } = require('../utils/email');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.submitContact = asyncHandler(async (req, res) => {
  const name    = String(req.body?.name    || '').trim();
  const email   = String(req.body?.email   || '').trim();
  const subject = String(req.body?.subject || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !email || !message)
    return res.status(400).json({ error: 'Name, email and message are required' });
  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: 'Please enter a valid email address' });
  if (message.length > 5000)
    return res.status(400).json({ error: 'Message is too long' });

  const sent = await sendContactEmail(name, email, message, subject);
  if (!sent) {
    return res.status(502).json({ error: 'We couldn’t send your message right now — please try again later' });
  }
  res.status(201).json({ message: 'Message sent. We’ll get back to you soon.' });
});
