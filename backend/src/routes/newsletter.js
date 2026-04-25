const router = require('express').Router();
const { subscribe, list } = require('../controllers/newsletterController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', subscribe);                              // public
router.get('/',  authenticate, requireAdmin, list);       // admin only

module.exports = router;
