const router = require('express').Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getFeatured,
} = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/',        getProducts);
router.get('/featured', getFeatured);
router.get('/:slug',   getProduct);
router.post('/',       authenticate, requireAdmin, createProduct);
router.patch('/:id',  authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
