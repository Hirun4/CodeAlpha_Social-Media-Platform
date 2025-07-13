const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const {
  getProfile,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers
} = require('../controllers/userController');

const router = express.Router();

// Multer setup for avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Avatar upload endpoint
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarPath = '/uploads/' + req.file.filename;
    req.user.avatar = avatarPath;
    await req.user.save();
    res.json({ avatar: avatarPath });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user profile
router.get('/profile', auth, getProfile);

// Get user profile by ID
router.get('/profile/:id', auth, getUserProfile);

// Update profile
router.put('/profile', auth, updateProfile);

// Follow user
router.post('/follow/:id', auth, followUser);

// Unfollow user
router.post('/unfollow/:id', auth, unfollowUser);

// Search users
router.get('/search', auth, searchUsers);

module.exports = router;