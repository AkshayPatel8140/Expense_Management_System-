const express = require('express');
const Goal = require('../models/Goal');
const router = express.Router();

// Get all goals for user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new goal
router.post('/', async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      user: req.user.userId
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 