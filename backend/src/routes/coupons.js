const router = require('express').Router();
const { validateCoupon } = require('../controllers/couponController');
const { authenticate } = require('../middleware/auth');

// Customer-facing: validate a coupon for a given subtotal before checkout.
router.post('/validate', authenticate, validateCoupon);

module.exports = router;
