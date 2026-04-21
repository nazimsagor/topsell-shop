const router = require('express').Router();
const { getCategories, getCategory, createCategory, updateCategory } = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', authenticate, requireAdmin, createCategory);
router.patch('/:id', authenticate, requireAdmin, updateCategory);

module.exports = router;
