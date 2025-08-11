const express = require('express');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const router = express.Router();

// Get all transactions for user
router.get('/', async (req, res) => {
  try {
    // For demo purposes, return mock data if no user is authenticated
    if (!req.userId) {
      const mockTransactions = [
        { id: 1, description: 'Grocery Store', amount: -85.50, category: 'Food & Dining', date: '2024-01-15', type: 'expense' },
        { id: 2, description: 'Salary Deposit', amount: 2500.00, category: 'Income', date: '2024-01-14', type: 'income' },
        { id: 3, description: 'Gas Station', amount: -45.00, category: 'Transportation', date: '2024-01-13', type: 'expense' },
        { id: 4, description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-12', type: 'expense' },
        { id: 5, description: 'Coffee Shop', amount: -4.50, category: 'Food & Dining', date: '2024-01-11', type: 'expense' },
        { id: 6, description: 'Freelance Work', amount: 500.00, category: 'Income', date: '2024-01-10', type: 'income' },
        { id: 7, description: 'Restaurant', amount: -65.00, category: 'Food & Dining', date: '2024-01-09', type: 'expense' },
        { id: 8, description: 'Uber Ride', amount: -25.00, category: 'Transportation', date: '2024-01-08', type: 'expense' },
      ];
      return res.json(mockTransactions);
    }

    const transactions = await Transaction.find({ userId: req.userId })
      .populate('category')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    // For demo purposes, create a mock transaction
    if (!req.userId) {
      const newTransaction = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      return res.status(201).json(newTransaction);
    }

    // Get or create a default category
    let categoryId;
    try {
      let category = await Category.findOne({ name: req.body.category });
      if (!category) {
        category = new Category({
          name: req.body.category,
          type: req.body.type || 'expense',
          color: '#1976d2',
          icon: 'receipt'
        });
        await category.save();
      }
      categoryId = category._id;
    } catch (error) {
      // If category creation fails, use a default category
      categoryId = '507f1f77bcf86cd799439011'; // Default category ID
    }

    const transaction = new Transaction({
      ...req.body,
      userId: req.userId,
      category: categoryId,
      account: req.body.account || 'cash', // Default account
      date: req.body.date ? new Date(req.body.date) : new Date()
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single transaction
router.get('/:id', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('category');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 