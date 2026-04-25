const router = require('express').Router();
const { listBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', listBanners);
router.post('/',       authenticate, requireAdmin, createBanner);
router.patch('/:id',   authenticate, requireAdmin, updateBanner);
router.delete('/:id',  authenticate, requireAdmin, deleteBanner);

module.exports = router;
