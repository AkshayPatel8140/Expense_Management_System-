const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'both'],
    required: true
  },
  
  // Hierarchy
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  path: {
    type: String,
    index: true
  },
  
  // Visual & UI
  icon: {
    type: String,
    default: 'category'
  },
  color: {
    type: String,
    default: '#2196F3',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  emoji: String,
  
  // System vs User Categories
  isSystemCategory: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isSystemCategory;
    }
  },
  
  // Budgeting
  defaultBudgetAmount: {
    type: Number,
    min: 0
  },
  budgetRecommendation: {
    percentage: Number, // Percentage of income
    amount: Number,
    basedOn: String // 'income_percentage', 'historical_average', 'user_goal'
  },
  
  // ML & Auto-categorization
  keywords: [{
    term: {
      type: String,
      lowercase: true,
      trim: true
    },
    weight: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 10
    },
    source: {
      type: String,
      enum: ['system', 'user_added', 'ml_generated'],
      default: 'system'
    }
  }],
  merchantPatterns: [{
    pattern: String,
    confidence: Number,
    lastUpdated: Date
  }],
  
  // Tax & Business
  taxDeductible: {
    type: Boolean,
    default: false
  },
  taxCategory: String,
  businessExpenseCategory: {
    type: Boolean,
    default: false
  },
  
  // Analytics & Usage
  usage: {
    transactionCount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    avgTransactionAmount: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    frequency: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      quarterly: Number,
      yearly: Number
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
categorySchema.index({ isSystemCategory: 1, name: 1 }, { unique: true, partialFilterExpression: { isSystemCategory: true } });
categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ 'keywords.term': 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for full path name
categorySchema.virtual('fullName').get(function() {
  if (this.path) {
    return this.path.split('/').join(' > ');
  }
  return this.name;
});

// Virtual for transaction count (would be populated)
categorySchema.virtual('transactionCount').get(function() {
  return this.usage?.transactionCount || 0;
});

// Pre-save middleware
categorySchema.pre('save', async function(next) {
  // Set path for hierarchical structure
  if (this.parentCategory) {
    const parent = await this.constructor.findById(this.parentCategory);
    if (parent) {
      this.path = parent.path ? `${parent.path}/${this.name}` : this.name;
      this.level = parent.level + 1;
    }
  } else {
    this.path = this.name;
    this.level = 0;
  }
  
  next();
});

// Methods
categorySchema.methods.addKeyword = function(term, weight = 1.0, source = 'user_added') {
  const existingKeyword = this.keywords.find(k => k.term === term.toLowerCase());
  
  if (existingKeyword) {
    existingKeyword.weight = Math.max(existingKeyword.weight, weight);
    existingKeyword.source = source;
  } else {
    this.keywords.push({
      term: term.toLowerCase(),
      weight,
      source
    });
  }
  
  return this.save();
};

categorySchema.methods.updateUsageStats = async function() {
  const Transaction = mongoose.model('Transaction');
  
  const stats = await Transaction.aggregate([
    { $match: { category: this._id } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: { $abs: '$amount' } },
        avgAmount: { $avg: { $abs: '$amount' } },
        lastUsed: { $max: '$date' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.usage = {
      ...this.usage,
      transactionCount: stats[0].count,
      totalAmount: stats[0].totalAmount,
      avgTransactionAmount: stats[0].avgAmount,
      lastUsed: stats[0].lastUsed
    };
    
    return this.save();
  }
};

categorySchema.methods.getRecommendedBudget = function(userIncome) {
  if (this.budgetRecommendation?.percentage && userIncome) {
    return (userIncome * this.budgetRecommendation.percentage) / 100;
  }
  
  if (this.budgetRecommendation?.amount) {
    return this.budgetRecommendation.amount;
  }
  
  if (this.defaultBudgetAmount) {
    return this.defaultBudgetAmount;
  }
  
  // Fallback to usage average
  return this.usage?.avgTransactionAmount || 0;
};

categorySchema.methods.matchesTransaction = function(transaction) {
  const description = transaction.description?.toLowerCase() || '';
  const merchantName = transaction.merchant?.name?.toLowerCase() || '';
  
  // Check keyword matches
  let score = 0;
  for (const keyword of this.keywords) {
    if (description.includes(keyword.term) || merchantName.includes(keyword.term)) {
      score += keyword.weight;
    }
  }
  
  // Check merchant patterns
  for (const pattern of this.merchantPatterns) {
    const regex = new RegExp(pattern.pattern, 'i');
    if (regex.test(merchantName)) {
      score += pattern.confidence;
    }
  }
  
  return score;
};

// Static methods
categorySchema.statics.getSystemCategories = function() {
  return this.find({ isSystemCategory: true, isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getUserCategories = function(userId) {
  return this.find({ userId, isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getAllUserCategories = function(userId) {
  return this.find({
    $or: [
      { isSystemCategory: true },
      { userId }
    ],
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.createDefaultCategories = async function(userId) {
  const defaultCategories = [
    // Income Categories
    { name: 'Salary', type: 'income', icon: 'work', color: '#4CAF50', keywords: [{ term: 'salary' }, { term: 'paycheck' }, { term: 'wages' }] },
    { name: 'Freelance', type: 'income', icon: 'person_work', color: '#4CAF50', keywords: [{ term: 'freelance' }, { term: 'contract' }, { term: 'consulting' }] },
    { name: 'Investment', type: 'income', icon: 'trending_up', color: '#4CAF50', keywords: [{ term: 'dividend' }, { term: 'interest' }, { term: 'capital gains' }] },
    { name: 'Other Income', type: 'income', icon: 'attach_money', color: '#4CAF50', keywords: [{ term: 'bonus' }, { term: 'gift' }, { term: 'refund' }] },
    
    // Expense Categories
    { name: 'Housing', type: 'expense', icon: 'home', color: '#F44336', keywords: [{ term: 'rent' }, { term: 'mortgage' }, { term: 'utilities' }] },
    { name: 'Food & Dining', type: 'expense', icon: 'restaurant', color: '#FF9800', keywords: [{ term: 'grocery' }, { term: 'restaurant' }, { term: 'food' }] },
    { name: 'Transportation', type: 'expense', icon: 'directions_car', color: '#2196F3', keywords: [{ term: 'gas' }, { term: 'uber' }, { term: 'bus' }, { term: 'taxi' }] },
    { name: 'Healthcare', type: 'expense', icon: 'local_hospital', color: '#E91E63', keywords: [{ term: 'doctor' }, { term: 'pharmacy' }, { term: 'medical' }] },
    { name: 'Entertainment', type: 'expense', icon: 'movie', color: '#9C27B0', keywords: [{ term: 'netflix' }, { term: 'movie' }, { term: 'concert' }] },
    { name: 'Shopping', type: 'expense', icon: 'shopping_cart', color: '#FF5722', keywords: [{ term: 'amazon' }, { term: 'clothes' }, { term: 'shopping' }] },
    { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#795548', keywords: [{ term: 'electric' }, { term: 'water' }, { term: 'internet' }] },
    { name: 'Personal Care', type: 'expense', icon: 'spa', color: '#607D8B', keywords: [{ term: 'haircut' }, { term: 'cosmetics' }, { term: 'gym' }] },
    { name: 'Education', type: 'expense', icon: 'school', color: '#3F51B5', keywords: [{ term: 'tuition' }, { term: 'books' }, { term: 'course' }] },
    { name: 'Savings', type: 'expense', icon: 'savings', color: '#009688', keywords: [{ term: 'savings' }, { term: 'emergency fund' }] },
    { name: 'Other', type: 'expense', icon: 'category', color: '#9E9E9E', keywords: [{ term: 'miscellaneous' }] }
  ];
  
  const createdCategories = [];
  
  for (const categoryData of defaultCategories) {
    const category = new this({
      ...categoryData,
      userId,
      isDefault: true,
      sortOrder: createdCategories.length
    });
    
    await category.save();
    createdCategories.push(category);
  }
  
  return createdCategories;
};

categorySchema.statics.suggestCategory = function(transaction) {
  return this.find({ isActive: true }).then(categories => {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const category of categories) {
      const score = category.matchesTransaction(transaction);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    }
    
    return { category: bestMatch, confidence: bestScore };
  });
};

module.exports = mongoose.model('Category', categorySchema);