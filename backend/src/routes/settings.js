const router = require('express').Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getSettings);                                   // public read
router.patch('/', authenticate, requireAdmin, updateSettings);  // admin write

module.exports = router;
