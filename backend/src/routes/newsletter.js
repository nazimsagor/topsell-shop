const router = require('express').Router();
const { subscribe, list, deleteSubscriber } = require('../controllers/newsletterController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', subscribe);                                          // public
router.get('/',     authenticate, requireAdmin, list);                // admin only
router.delete('/:id', authenticate, requireAdmin, deleteSubscriber);  // admin only

module.exports = router;
