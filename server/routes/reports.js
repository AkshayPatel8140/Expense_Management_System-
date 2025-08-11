const express = require('express');
const router = express.Router();

// Get spending report
router.get('/spending', async (req, res) => {
  try {
    // Placeholder for spending report logic
    res.json({ message: 'Spending report endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 