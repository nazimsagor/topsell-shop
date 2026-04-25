const router = require('express').Router();
const {
  listPosts, getPost, createPost, updatePost, deletePost,
} = require('../controllers/blogController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public: list + read by id
router.get('/',     listPosts);
router.get('/:id',  getPost);

// Admin only: write operations
router.post('/',         authenticate, requireAdmin, createPost);
router.patch('/:id',     authenticate, requireAdmin, updatePost);
router.delete('/:id',    authenticate, requireAdmin, deletePost);

module.exports = router;
