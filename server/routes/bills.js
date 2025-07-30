const express = require('express');
const router = express.Router();

// Get all bills for user
router.get('/', async (req, res) => {
  try {
    // Placeholder for bills logic
    res.json({ message: 'Bills endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 