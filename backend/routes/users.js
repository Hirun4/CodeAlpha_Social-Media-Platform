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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


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


router.get('/profile', auth, getProfile);


router.get('/profile/:id', auth, getUserProfile);


router.put('/profile', auth, updateProfile);


router.post('/follow/:id', auth, followUser);


router.post('/unfollow/:id', auth, unfollowUser);


router.get('/search', auth, searchUsers);

module.exports = router;