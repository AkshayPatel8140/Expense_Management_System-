const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();

// Get all budgets for user
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      user: req.user.userId
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 