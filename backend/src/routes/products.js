const router = require('express').Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getFeatured,
} = require('../controllers/productController');
const { listReviews, addReview } = require('../controllers/reviewController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/',        getProducts);
router.get('/featured', getFeatured);
router.get('/:slug',   getProduct);
router.post('/',       authenticate, requireAdmin, createProduct);
router.patch('/:id',  authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

// Reviews
router.get('/:id/reviews',  listReviews);
router.post('/:id/reviews', authenticate, addReview);

module.exports = router;
