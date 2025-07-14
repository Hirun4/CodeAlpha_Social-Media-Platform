const express = require('express');
const auth = require('../middleware/auth');
const {
  createComment,
  getComments,
  likeComment,
  deleteComment
} = require('../controllers/commentController');

const router = express.Router();


router.post('/post/:postId', auth, createComment);


router.get('/post/:postId', auth, getComments);


router.post('/:id/like', auth, likeComment);


router.delete('/:id', auth, deleteComment);

module.exports = router;