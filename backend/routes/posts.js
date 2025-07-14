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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


router.post('/', auth, upload.single('image'), createPost);


router.get('/feed', auth, getFeedPosts);


router.post('/:id/like', auth, likePost);


router.delete('/:id', auth, deletePost);

router.put('/:id', auth, upload.single('image'), editPost);


router.get('/all', getAllPosts);
router.get('/:id', auth, getPost);

module.exports = router;