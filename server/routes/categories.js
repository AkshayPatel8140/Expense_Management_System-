const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// Get all categories for user
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.userId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      user: req.user.userId
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 