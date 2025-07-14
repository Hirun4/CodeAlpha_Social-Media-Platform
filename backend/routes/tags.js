const express = require('express');
const Tag = require('../models/Tag');
const router = express.Router();

router.get('/', async (req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json(tags);
});

module.exports = router;