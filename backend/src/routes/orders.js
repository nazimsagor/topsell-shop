const router = require('express').Router();
const { createOrder, getOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
