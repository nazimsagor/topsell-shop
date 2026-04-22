const router = require('express').Router();
const {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Authenticated: user initiates payment from checkout
router.post('/init', authenticate, initPayment);

// Public callbacks — SSLCommerz POSTs form-encoded data; browser follows redirect.
// These MUST NOT require auth, because the request comes from SSLCommerz / user's
// browser after leaving our site.
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.post('/ipn', paymentIpn);

// Some gateways GET these in certain flows; accept both so we never 404 the user.
router.get('/success', paymentSuccess);
router.get('/fail', paymentFail);
router.get('/cancel', paymentCancel);

module.exports = router;
