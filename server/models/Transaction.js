const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Basic Transaction Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value !== 0;
      },
      message: 'Transaction amount cannot be zero'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],

  // Merchant & Location
  merchant: {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    category: String, // Merchant category code
    website: String
  },

  // Account Information
  account: {
    type: String,
    required: true,
    enum: ['cash', 'checking', 'savings', 'credit', 'investment', 'other']
  },
  accountId: String, // External account ID for bank integration
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['cash', 'debit_card', 'credit_card', 'check', 'bank_transfer', 'mobile_payment', 'cryptocurrency', 'other'],
    default: 'cash'
  },
  cardLast4: String,
  checkNumber: String,
  referenceNumber: String,

  // Receipt & Documentation
  receipt: {
    originalFilename: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadDate: Date,
    ocrText: String,
    ocrConfidence: Number,
    processedData: {
      extractedAmount: Number,
      extractedDate: Date,
      extractedMerchant: String,
      extractedItems: [{
        name: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number
      }]
    }
  },

  // Recurring Transaction
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'annually'],
      required: function() { return this.isRecurring; }
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: Date,
    nextDueDate: Date,
    occurrences: Number,
    currentOccurrence: {
      type: Number,
      default: 0
    }
  },
  parentRecurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },

  // Split Transactions
  isSplit: {
    type: Boolean,
    default: false
  },
  splitWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    name: String,
    amount: Number,
    percentage: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'paid'],
      default: 'pending'
    },
    paidDate: Date
  }],
  originalAmount: Number, // Total amount before split

  // Categorization ML
  autoCategories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    confidence: Number,
    algorithm: String
  }],
  userCorrectedCategory: {
    type: Boolean,
    default: false
  },
  
  // Budget Tracking
  budgetPeriod: {
    year: Number,
    month: Number,
    quarter: Number,
    week: Number
  },
  exceedsBudget: {
    type: Boolean,
    default: false
  },

  // Status & Flags
  status: {
    type: String,
    enum: ['pending', 'cleared', 'reconciled', 'cancelled'],
    default: 'cleared'
  },
  isTransfer: {
    type: Boolean,
    default: false
  },
  transferToAccount: String,
  transferId: String,
  
  // Tax & Business
  isTaxDeductible: {
    type: Boolean,
    default: false
  },
  taxCategory: String,
  isBusinessExpense: {
    type: Boolean,
    default: false
  },
  clientProject: String,

  // Notes & Metadata
  notes: {
    type: String,
    maxlength: 1000
  },
  mood: {
    type: String,
    enum: ['very_happy', 'happy', 'neutral', 'regretful', 'very_regretful']
  },
  importSource: String, // 'manual', 'csv', 'bank_api', 'receipt_scan'
  
  // Analytics
  analytics: {
    spendingVelocity: Number, // How quickly user spent after last transaction
    categoryFrequency: Number, // How often user spends in this category
    merchantFrequency: Number, // How often user shops at this merchant
    budgetImpact: Number, // Percentage of budget this transaction represents
    goalImpact: [{
      goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal'
      },
      impact: Number // Positive or negative impact on goal
    }]
  },

  // Audit Trail
  lastModified: {
    date: {
      type: Date,
      default: Date.now
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      timestamp: Date
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, 'budgetPeriod.year': 1, 'budgetPeriod.month': 1 });
transactionSchema.index({ 'merchant.name': 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ isRecurring: 1, 'recurringPattern.nextDueDate': 1 });

// Virtual for absolute amount
transactionSchema.virtual('absoluteAmount').get(function() {
  return Math.abs(this.amount);
});

// Virtual for display amount (positive for income, negative for expenses)
transactionSchema.virtual('displayAmount').get(function() {
  return this.type === 'income' ? Math.abs(this.amount) : -Math.abs(this.amount);
});

// Virtual for budget period string
transactionSchema.virtual('budgetPeriodString').get(function() {
  if (!this.budgetPeriod) return null;
  return `${this.budgetPeriod.year}-${this.budgetPeriod.month}`;
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Ensure amount has correct sign
  if (this.type === 'expense' && this.amount > 0) {
    this.amount = -Math.abs(this.amount);
  } else if (this.type === 'income' && this.amount < 0) {
    this.amount = Math.abs(this.amount);
  }

  // Set budget period
  const date = new Date(this.date);
  this.budgetPeriod = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    quarter: Math.ceil((date.getMonth() + 1) / 3),
    week: Math.ceil(date.getDate() / 7)
  };

  // Update next due date for recurring transactions
  if (this.isRecurring && this.recurringPattern.frequency) {
    this.calculateNextDueDate();
  }

  next();
});

// Methods
transactionSchema.methods.calculateNextDueDate = function() {
  if (!this.isRecurring || !this.recurringPattern.frequency) return null;

  const currentDate = new Date(this.date);
  const interval = this.recurringPattern.interval || 1;
  
  switch (this.recurringPattern.frequency) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + (7 * interval));
      break;
    case 'biweekly':
      currentDate.setDate(currentDate.getDate() + (14 * interval));
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + interval);
      break;
    case 'quarterly':
      currentDate.setMonth(currentDate.getMonth() + (3 * interval));
      break;
    case 'semiannually':
      currentDate.setMonth(currentDate.getMonth() + (6 * interval));
      break;
    case 'annually':
      currentDate.setFullYear(currentDate.getFullYear() + interval);
      break;
  }

  this.recurringPattern.nextDueDate = currentDate;
  return currentDate;
};

transactionSchema.methods.createRecurringInstance = function() {
  const newTransaction = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    date: this.recurringPattern.nextDueDate,
    parentRecurringId: this._id,
    recurringPattern: {
      ...this.recurringPattern,
      currentOccurrence: (this.recurringPattern.currentOccurrence || 0) + 1
    }
  });
  
  return newTransaction;
};

transactionSchema.methods.addSplitParticipant = function(participant) {
  this.splitWith.push(participant);
  this.isSplit = true;
  
  // Recalculate amounts
  const totalParticipants = this.splitWith.length + 1; // +1 for the creator
  const amountPerPerson = this.originalAmount / totalParticipants;
  
  this.splitWith.forEach(split => {
    if (!split.amount) split.amount = amountPerPerson;
  });
  
  this.amount = amountPerPerson;
};

transactionSchema.methods.updateAnalytics = async function() {
  // This would be called by analytics service
  // Implementation would calculate various metrics
  this.analytics = this.analytics || {};
  
  // Calculate category frequency
  const categoryCount = await this.constructor.countDocuments({
    userId: this.userId,
    category: this.category,
    date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
  });
  
  this.analytics.categoryFrequency = categoryCount;
  
  return this.save();
};

// Static methods
transactionSchema.statics.getSpendingTrends = function(userId, period = 'monthly') {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId), type: 'expense' };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: '$budgetPeriod.year',
          month: '$budgetPeriod.month'
        },
        totalAmount: { $sum: { $abs: '$amount' } },
        count: { $sum: 1 },
        avgAmount: { $avg: { $abs: '$amount' } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};

transactionSchema.statics.getCategoryBreakdown = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        totalAmount: { $sum: { $abs: '$amount' } },
        count: { $sum: 1 },
        type: { $first: '$type' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);