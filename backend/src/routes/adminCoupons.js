const router = require('express').Router();
const {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/',        listCoupons);
router.get('/:id',     getCoupon);
router.post('/',       createCoupon);
router.patch('/:id',   updateCoupon);
router.delete('/:id',  deleteCoupon);

module.exports = router;
