const router = require('express').Router();
const {
  getUsers, getWishlist, toggleWishlist, getDashboard,
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/admin/dashboard', requireAdmin, getDashboard);
router.get('/',                requireAdmin, getUsers);
router.get('/wishlist',                      getWishlist);
router.post('/wishlist',                     toggleWishlist);

module.exports = router;
