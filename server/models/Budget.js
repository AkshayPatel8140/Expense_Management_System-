const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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

  // Time Period
  period: {
    type: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    year: Number,
    month: Number,
    quarter: Number,
    week: Number
  },

  // Budget Categories
  categories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    budgetedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    actualAmount: {
      type: Number,
      default: 0
    },
    spentAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: function() {
        return this.budgetedAmount - this.spentAmount;
      }
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    
    // Variance Analysis
    variance: {
      amount: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ['under', 'on_track', 'over', 'exceeded'],
        default: 'on_track'
      }
    },
    
    // Alerts
    alerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      thresholds: {
        warning: {
          type: Number,
          default: 80,
          min: 0,
          max: 100
        },
        critical: {
          type: Number,
          default: 95,
          min: 0,
          max: 100
        }
      },
      lastAlert: Date,
      alertCount: {
        type: Number,
        default: 0
      }
    },
    
    // Rollover
    allowRollover: {
      type: Boolean,
      default: false
    },
    rolledOverAmount: {
      type: Number,
      default: 0
    },
    rolledOverFrom: Date,
    
    // Notes
    notes: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],

  // Overall Budget Totals
  totalBudgeted: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  totalRemaining: {
    type: Number,
    default: 0
  },
  
  // Income Planning
  plannedIncome: {
    type: Number,
    default: 0
  },
  actualIncome: {
    type: Number,
    default: 0
  },
  incomeVariance: {
    amount: Number,
    percentage: Number
  },

  // Budget Goals & Targets
  savingsGoal: {
    amount: Number,
    percentage: Number,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  
  emergencyFundGoal: {
    amount: Number,
    currentAmount: Number,
    monthsOfExpenses: Number
  },

  // Performance Metrics
  performance: {
    accuracyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    adherenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    varianceScore: {
      type: Number,
      min: -100,
      max: 100,
      default: 0
    },
    improvementTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable'
    }
  },

  // Status & Settings
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: String,
  
  // Auto-adjustment Settings
  autoAdjustment: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly'
    },
    strategy: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    lastAdjusted: Date
  },

  // Notifications
  notifications: {
    budgetExceeded: {
      type: Boolean,
      default: true
    },
    approachingLimit: {
      type: Boolean,
      default: true
    },
    periodEnd: {
      type: Boolean,
      default: true
    },
    monthlyReport: {
      type: Boolean,
      default: true
    }
  },

  // Analysis & Insights
  insights: [{
    type: {
      type: String,
      enum: ['overspending', 'underspending', 'trend_change', 'goal_progress', 'recommendation']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info'
    },
    actionRequired: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],

  // Comparison with Previous Periods
  comparison: {
    previousPeriod: {
      budgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
      },
      spentAmount: Number,
      budgetedAmount: Number,
      variance: Number
    },
    averageSpending: {
      last3Months: Number,
      last6Months: Number,
      last12Months: Number
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
budgetSchema.index({ userId: 1, 'period.startDate': -1 });
budgetSchema.index({ userId: 1, status: 1 });
budgetSchema.index({ userId: 1, 'period.type': 1, 'period.year': 1, 'period.month': 1 });
budgetSchema.index({ status: 1, 'period.endDate': 1 });
budgetSchema.index({ isTemplate: 1 });

// Virtual for overall variance
budgetSchema.virtual('overallVariance').get(function() {
  if (this.totalBudgeted === 0) return 0;
  return {
    amount: this.totalSpent - this.totalBudgeted,
    percentage: ((this.totalSpent - this.totalBudgeted) / this.totalBudgeted) * 100
  };
});

// Virtual for completion percentage
budgetSchema.virtual('completionPercentage').get(function() {
  const now = new Date();
  const start = new Date(this.period.startDate);
  const end = new Date(this.period.endDate);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.round((elapsed / total) * 100);
});

// Virtual for expected spending at this point
budgetSchema.virtual('expectedSpending').get(function() {
  const completion = this.completionPercentage;
  return (this.totalBudgeted * completion) / 100;
});

// Virtual for spending pace
budgetSchema.virtual('spendingPace').get(function() {
  const expected = this.expectedSpending;
  if (expected === 0) return 'on_track';
  
  const variance = ((this.totalSpent - expected) / expected) * 100;
  
  if (variance < -10) return 'under';
  if (variance > 10) return 'over';
  return 'on_track';
});

// Pre-save middleware
budgetSchema.pre('save', function(next) {
  // Calculate totals
  this.totalBudgeted = this.categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
  this.totalSpent = this.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
  this.totalRemaining = this.totalBudgeted - this.totalSpent;
  
  // Calculate period fields
  const startDate = new Date(this.period.startDate);
  this.period.year = startDate.getFullYear();
  this.period.month = startDate.getMonth() + 1;
  this.period.quarter = Math.ceil((startDate.getMonth() + 1) / 3);
  this.period.week = Math.ceil(startDate.getDate() / 7);
  
  // Update category variances
  this.categories.forEach(category => {
    category.remainingAmount = category.budgetedAmount - category.spentAmount;
    category.variance = {
      amount: category.spentAmount - category.budgetedAmount,
      percentage: category.budgetedAmount > 0 
        ? ((category.spentAmount - category.budgetedAmount) / category.budgetedAmount) * 100 
        : 0
    };
    
    // Determine status
    const spentPercentage = category.budgetedAmount > 0 
      ? (category.spentAmount / category.budgetedAmount) * 100 
      : 0;
      
    if (spentPercentage <= 50) {
      category.variance.status = 'under';
    } else if (spentPercentage <= 100) {
      category.variance.status = 'on_track';
    } else if (spentPercentage <= 120) {
      category.variance.status = 'over';
    } else {
      category.variance.status = 'exceeded';
    }
    
    category.lastUpdated = new Date();
  });
  
  // Calculate performance scores
  this.calculatePerformanceScores();
  
  next();
});

// Methods
budgetSchema.methods.calculatePerformanceScores = function() {
  if (this.categories.length === 0) return;
  
  // Accuracy Score: How close actual spending is to budgeted amounts
  let totalVariance = 0;
  this.categories.forEach(cat => {
    if (cat.budgetedAmount > 0) {
      totalVariance += Math.abs(cat.variance.percentage);
    }
  });
  this.performance.accuracyScore = Math.max(0, 100 - (totalVariance / this.categories.length));
  
  // Adherence Score: How well user stays within budget limits
  const categoriesOnTrack = this.categories.filter(cat => 
    cat.variance.status === 'under' || cat.variance.status === 'on_track'
  ).length;
  this.performance.adherenceScore = (categoriesOnTrack / this.categories.length) * 100;
  
  // Variance Score: Overall budget performance
  const overallVariance = this.overallVariance;
  if (overallVariance.percentage <= 5) {
    this.performance.varianceScore = 100;
  } else if (overallVariance.percentage > 0) {
    this.performance.varianceScore = Math.max(-100, 100 - (overallVariance.percentage * 2));
  } else {
    this.performance.varianceScore = Math.min(100, 100 + Math.abs(overallVariance.percentage));
  }
};

budgetSchema.methods.updateSpending = async function() {
  const Transaction = mongoose.model('Transaction');
  
  // Get all transactions for this budget period
  const transactions = await Transaction.find({
    userId: this.userId,
    type: 'expense',
    date: {
      $gte: this.period.startDate,
      $lte: this.period.endDate
    }
  }).populate('category');
  
  // Reset spending amounts
  this.categories.forEach(cat => {
    cat.spentAmount = 0;
  });
  
  // Calculate spending by category
  transactions.forEach(transaction => {
    const categoryBudget = this.categories.find(cat => 
      cat.category._id.toString() === transaction.category._id.toString()
    );
    
    if (categoryBudget) {
      categoryBudget.spentAmount += Math.abs(transaction.amount);
    }
  });
  
  // Update income if applicable
  const incomeTransactions = await Transaction.find({
    userId: this.userId,
    type: 'income',
    date: {
      $gte: this.period.startDate,
      $lte: this.period.endDate
    }
  });
  
  this.actualIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  this.incomeVariance = {
    amount: this.actualIncome - this.plannedIncome,
    percentage: this.plannedIncome > 0 
      ? ((this.actualIncome - this.plannedIncome) / this.plannedIncome) * 100 
      : 0
  };
  
  return this.save();
};

budgetSchema.methods.checkAlerts = function() {
  const alerts = [];
  
  this.categories.forEach(category => {
    if (!category.alerts.enabled || category.budgetedAmount === 0) return;
    
    const spentPercentage = (category.spentAmount / category.budgetedAmount) * 100;
    
    // Critical alert
    if (spentPercentage >= category.alerts.thresholds.critical) {
      alerts.push({
        type: 'critical',
        category: category.category,
        message: `Critical: ${spentPercentage.toFixed(1)}% of budget spent`,
        spentPercentage,
        amount: category.spentAmount,
        budgetedAmount: category.budgetedAmount
      });
    }
    // Warning alert
    else if (spentPercentage >= category.alerts.thresholds.warning) {
      alerts.push({
        type: 'warning',
        category: category.category,
        message: `Warning: ${spentPercentage.toFixed(1)}% of budget spent`,
        spentPercentage,
        amount: category.spentAmount,
        budgetedAmount: category.budgetedAmount
      });
    }
  });
  
  return alerts;
};

budgetSchema.methods.generateInsights = function() {
  const insights = [];
  
  // Check for overspending categories
  this.categories.forEach(category => {
    if (category.variance.status === 'exceeded') {
      insights.push({
        type: 'overspending',
        message: `You've exceeded your budget for ${category.category.name} by ${category.variance.percentage.toFixed(1)}%`,
        severity: 'error',
        actionRequired: true
      });
    }
  });
  
  // Check overall budget health
  const overallVariance = this.overallVariance;
  if (overallVariance.percentage > 10) {
    insights.push({
      type: 'overspending',
      message: `Your overall spending is ${overallVariance.percentage.toFixed(1)}% over budget`,
      severity: 'warning',
      actionRequired: true
    });
  }
  
  // Check savings goal progress
  if (this.savingsGoal && this.actualIncome > 0) {
    const actualSavings = this.actualIncome - this.totalSpent;
    const savingsRate = (actualSavings / this.actualIncome) * 100;
    
    if (savingsRate < (this.savingsGoal.percentage || 0)) {
      insights.push({
        type: 'goal_progress',
        message: `Your savings rate of ${savingsRate.toFixed(1)}% is below your goal of ${this.savingsGoal.percentage}%`,
        severity: 'warning',
        actionRequired: false
      });
    }
  }
  
  this.insights = insights;
  return insights;
};

budgetSchema.methods.createFromTemplate = function(templateId, startDate) {
  const Template = this.constructor;
  
  return Template.findById(templateId).then(template => {
    if (!template || !template.isTemplate) {
      throw new Error('Template not found');
    }
    
    const newBudget = new this.constructor({
      ...template.toObject(),
      _id: undefined,
      isTemplate: false,
      templateName: template.name,
      period: {
        ...template.period,
        startDate: new Date(startDate)
      },
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined
    });
    
    // Calculate end date based on period type
    const endDate = new Date(startDate);
    switch (template.period.type) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    newBudget.period.endDate = endDate;
    
    return newBudget.save();
  });
};

// Static methods
budgetSchema.statics.getCurrentBudget = function(userId) {
  const now = new Date();
  return this.findOne({
    userId,
    status: 'active',
    'period.startDate': { $lte: now },
    'period.endDate': { $gte: now }
  }).populate('categories.category');
};

budgetSchema.statics.getBudgetSummary = function(userId, year, month) {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (year) matchStage['period.year'] = year;
  if (month) matchStage['period.month'] = month;
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBudgeted: { $sum: '$totalBudgeted' },
        totalSpent: { $sum: '$totalSpent' },
        budgetCount: { $sum: 1 },
        avgAccuracy: { $avg: '$performance.accuracyScore' },
        avgAdherence: { $avg: '$performance.adherenceScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('Budget', budgetSchema);