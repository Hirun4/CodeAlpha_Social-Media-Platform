const express = require('express');
const auth = require('../middleware/auth');
const {
  getProfile,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers
} = require('../controllers/userController');

const router = express.Router();

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