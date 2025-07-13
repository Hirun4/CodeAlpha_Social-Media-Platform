const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const {
  createPost,
  getFeedPosts,
  getPost,
  likePost,
  deletePost,
  getAllPosts,
  editPost
} = require('../controllers/postController');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create post (with optional image)
router.post('/', auth, upload.single('image'), createPost);

// Get feed posts
router.get('/feed',  getFeedPosts);

// Like/unlike post
router.post('/:id/like', auth, likePost);

// Delete post
router.delete('/:id', auth, deletePost);

// Edit post (with optional image)
router.put('/:id', auth, upload.single('image'), editPost);

// Get all posts
router.get('/all', getAllPosts);
router.get('/:id', auth, getPost);

module.exports = router;