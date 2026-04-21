const router = require('express').Router();
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// Cart now requires login (new schema has NOT NULL user_id)
router.use(authenticate);
router.get('/',            getCart);
router.post('/items',      addItem);
router.patch('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.delete('/',         clearCart);

module.exports = router;
