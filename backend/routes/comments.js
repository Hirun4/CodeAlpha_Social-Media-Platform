const express = require('express');
const auth = require('../middleware/auth');
const {
  createComment,
  getComments,
  likeComment,
  deleteComment
} = require('../controllers/commentController');

const router = express.Router();

// Create comment
router.post('/post/:postId', auth, createComment);

// Get comments for a post
router.get('/post/:postId', auth, getComments);

// Like/unlike comment
router.post('/:id/like', auth, likeComment);

// Delete comment
router.delete('/:id', auth, deleteComment);

module.exports = router;