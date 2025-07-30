const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Goal Type & Category
  type: {
    type: String,
    enum: ['savings', 'debt_payoff', 'investment', 'purchase', 'emergency_fund', 'retirement', 'education', 'travel', 'other'],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // SMART Goal Framework
  smart: {
    specific: {
      type: String,
      required: true,
      maxlength: 500
    },
    measurable: {
      metric: {
        type: String,
        enum: ['amount', 'percentage', 'count', 'ratio'],
        required: true
      },
      targetValue: {
        type: Number,
        required: true,
        min: 0
      },
      currentValue: {
        type: Number,
        default: 0,
        min: 0
      },
      unit: String // '$', '%', 'months', etc.
    },
    achievable: {
      monthlyContribution: {
        type: Number,
        default: 0,
        min: 0
      },
      feasibilityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      },
      adjustmentHistory: [{
        date: Date,
        oldTarget: Number,
        newTarget: Number,
        reason: String
      }]
    },
    relevant: {
      alignment: [{
        type: String,
        enum: ['financial_stability', 'wealth_building', 'debt_freedom', 'lifestyle_improvement', 'security']
      }],
      motivation: String,
      beneficiaries: [String]
    },
    timeBound: {
      startDate: {
        type: Date,
        default: Date.now
      },
      targetDate: {
        type: Date,
        required: true
      },
      estimatedCompletionDate: Date,
      isFlexible: {
        type: Boolean,
        default: false
      },
      milestones: [{
        title: String,
        targetDate: Date,
        targetValue: Number,
        achieved: {
          type: Boolean,
          default: false
        },
        achievedDate: Date,
        actualValue: Number
      }]
    }
  },

  // Progress Tracking
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    amountAchieved: {
      type: Number,
      default: 0,
      min: 0
    },
    amountRemaining: {
      type: Number,
      default: function() {
        return this.smart.measurable.targetValue - this.progress.amountAchieved;
      }
    },
    velocityPerMonth: Number, // How much progress per month
    projectedCompletion: Date,
    onTrack: {
      type: Boolean,
      default: true
    },
    daysRemaining: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Debt Payoff Specific (if type is debt_payoff)
  debtPayoff: {
    strategy: {
      type: String,
      enum: ['snowball', 'avalanche', 'custom'],
      default: 'avalanche'
    },
    debts: [{
      name: {
        type: String,
        required: true
      },
      balance: {
        type: Number,
        required: true,
        min: 0
      },
      interestRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      minimumPayment: {
        type: Number,
        required: true,
        min: 0
      },
      payoffOrder: Number,
      monthsToPayoff: Number,
      totalInterest: Number,
      payments: [{
        date: Date,
        amount: Number,
        principal: Number,
        interest: Number,
        remainingBalance: Number
      }]
    }],
    totalDebt: {
      type: Number,
      default: 0
    },
    totalMinimumPayment: {
      type: Number,
      default: 0
    },
    extraPayment: {
      type: Number,
      default: 0
    },
    payoffOrder: [Number],
    projectedPayoffDate: Date,
    totalInterestSaved: Number
  },

  // Savings Specific
  savings: {
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    monthlyContribution: {
      type: Number,
      default: 0,
      min: 0
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    compoundFrequency: {
      type: String,
      enum: ['daily', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    projectedFinalAmount: Number,
    contributions: [{
      date: Date,
      amount: Number,
      type: {
        type: String,
        enum: ['manual', 'automatic', 'bonus', 'windfall']
      },
      source: String
    }]
  },

  // Investment Goals
  investment: {
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    timeHorizon: {
      type: String,
      enum: ['short_term', 'medium_term', 'long_term'],
      default: 'long_term'
    },
    assetAllocation: {
      stocks: {
        type: Number,
        min: 0,
        max: 100,
        default: 70
      },
      bonds: {
        type: Number,
        min: 0,
        max: 100,
        default: 20
      },
      cash: {
        type: Number,
        min: 0,
        max: 100,
        default: 10
      },
      other: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    expectedReturn: {
      type: Number,
      min: 0,
      max: 30,
      default: 7
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Automation & Rules
  automation: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    amount: {
      type: Number,
      min: 0
    },
    sourceAccount: String,
    nextContribution: Date,
    rules: [{
      condition: String, // e.g., "income_received", "budget_surplus"
      action: String, // e.g., "increase_contribution", "decrease_contribution"
      value: Number
    }]
  },

  // Status & Lifecycle
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'abandoned', 'archived'],
    default: 'draft'
  },
  completedDate: Date,
  pausedReason: String,
  abandonedReason: String,

  // Notifications & Alerts
  notifications: {
    progressUpdates: {
      type: Boolean,
      default: true
    },
    milestoneAchieved: {
      type: Boolean,
      default: true
    },
    behindSchedule: {
      type: Boolean,
      default: true
    },
    contributionReminder: {
      type: Boolean,
      default: true
    },
    goalCompleted: {
      type: Boolean,
      default: true
    }
  },

  // Analytics & Insights
  analytics: {
    successProbability: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    requiredMonthlyProgress: Number,
    actualMonthlyProgress: Number,
    efficiencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    streaks: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      }
    },
    insights: [{
      type: {
        type: String,
        enum: ['behind_schedule', 'ahead_of_schedule', 'adjustment_needed', 'milestone_approaching', 'optimization_opportunity']
      },
      message: String,
      severity: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
      },
      actionable: Boolean,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Linked Resources
  linkedTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  linkedBudgets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  }],
  relatedGoals: [{
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    relationship: {
      type: String,
      enum: ['prerequisite', 'dependent', 'conflicting', 'complementary']
    }
  }],

  // Attachments & Documentation
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: Date,
    description: String
  }],
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'progress', 'adjustment', 'milestone'],
      default: 'general'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, type: 1 });
goalSchema.index({ userId: 1, 'smart.timeBound.targetDate': 1 });
goalSchema.index({ status: 1, 'smart.timeBound.targetDate': 1 });
goalSchema.index({ 'automation.enabled': 1, 'automation.nextContribution': 1 });

// Virtuals
goalSchema.virtual('daysUntilTarget').get(function() {
  const now = new Date();
  const target = new Date(this.smart.timeBound.targetDate);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

goalSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.smart.timeBound.targetDate) && this.status !== 'completed';
});

goalSchema.virtual('timeProgress').get(function() {
  const start = new Date(this.smart.timeBound.startDate);
  const end = new Date(this.smart.timeBound.targetDate);
  const now = new Date();
  
  if (now <= start) return 0;
  if (now >= end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.round((elapsed / total) * 100);
});

goalSchema.virtual('isOnTrack').get(function() {
  const timeProgress = this.timeProgress;
  const actualProgress = this.progress.percentage;
  
  // Goal is on track if actual progress is within 10% of time progress
  return Math.abs(actualProgress - timeProgress) <= 10;
});

// Pre-save middleware
goalSchema.pre('save', function(next) {
  // Calculate progress percentage
  if (this.smart.measurable.targetValue > 0) {
    this.progress.percentage = Math.min(100, 
      (this.smart.measurable.currentValue / this.smart.measurable.targetValue) * 100
    );
  }
  
  // Calculate amount remaining
  this.progress.amountRemaining = Math.max(0, 
    this.smart.measurable.targetValue - this.smart.measurable.currentValue
  );
  
  // Update days remaining
  this.progress.daysRemaining = this.daysUntilTarget;
  
  // Update on track status
  this.progress.onTrack = this.isOnTrack;
  
  // Calculate projected completion based on current velocity
  if (this.progress.velocityPerMonth && this.progress.amountRemaining > 0) {
    const monthsRemaining = this.progress.amountRemaining / this.progress.velocityPerMonth;
    this.progress.projectedCompletion = new Date(Date.now() + (monthsRemaining * 30 * 24 * 60 * 60 * 1000));
  }
  
  // Update debt payoff calculations if applicable
  if (this.type === 'debt_payoff' && this.debtPayoff.debts.length > 0) {
    this.calculateDebtPayoff();
  }
  
  // Update savings projections if applicable
  if (this.type === 'savings' && this.savings.currentAmount >= 0) {
    this.calculateSavingsProjection();
  }
  
  // Auto-complete if target reached
  if (this.progress.percentage >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  
  this.progress.lastUpdated = new Date();
  
  next();
});

// Methods
goalSchema.methods.calculateDebtPayoff = function() {
  const debts = [...this.debtPayoff.debts];
  const strategy = this.debtPayoff.strategy;
  const extraPayment = this.debtPayoff.extraPayment || 0;
  
  // Sort debts based on strategy
  if (strategy === 'snowball') {
    debts.sort((a, b) => a.balance - b.balance);
  } else if (strategy === 'avalanche') {
    debts.sort((a, b) => b.interestRate - a.interestRate);
  }
  
  // Calculate payoff order and timeline
  let totalInterest = 0;
  let currentDate = new Date();
  let availableExtra = extraPayment;
  
  debts.forEach((debt, index) => {
    debt.payoffOrder = index + 1;
    
    // Simple calculation - would need more sophisticated logic for exact calculations
    const monthlyPayment = debt.minimumPayment + (index === 0 ? availableExtra : 0);
    const monthsToPayoff = Math.ceil(debt.balance / monthlyPayment);
    
    debt.monthsToPayoff = monthsToPayoff;
    debt.totalInterest = (monthlyPayment * monthsToPayoff) - debt.balance;
    totalInterest += debt.totalInterest;
    
    currentDate.setMonth(currentDate.getMonth() + monthsToPayoff);
  });
  
  this.debtPayoff.totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  this.debtPayoff.totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  this.debtPayoff.projectedPayoffDate = currentDate;
  this.debtPayoff.totalInterestSaved = totalInterest;
  
  // Update main goal values
  this.smart.measurable.targetValue = this.debtPayoff.totalDebt;
  this.smart.measurable.currentValue = this.debtPayoff.totalDebt - 
    debts.reduce((sum, debt) => sum + debt.balance, 0);
};

goalSchema.methods.calculateSavingsProjection = function() {
  const currentAmount = this.savings.currentAmount;
  const monthlyContribution = this.savings.monthlyContribution;
  const annualRate = this.savings.interestRate / 100;
  const monthlyRate = annualRate / 12;
  const targetAmount = this.smart.measurable.targetValue;
  
  // Calculate months to reach goal with compound interest
  if (monthlyContribution > 0 && monthlyRate > 0) {
    const monthsToGoal = Math.log(
      (targetAmount * monthlyRate + monthlyContribution) / 
      (currentAmount * monthlyRate + monthlyContribution)
    ) / Math.log(1 + monthlyRate);
    
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(monthsToGoal));
    
    this.smart.timeBound.estimatedCompletionDate = projectedDate;
    this.savings.projectedFinalAmount = targetAmount;
  }
  
  // Update velocity
  this.progress.velocityPerMonth = monthlyContribution;
};

goalSchema.methods.addProgress = function(amount, note) {
  const oldValue = this.smart.measurable.currentValue;
  this.smart.measurable.currentValue = Math.min(
    this.smart.measurable.targetValue,
    oldValue + amount
  );
  
  // Update velocity calculation
  const daysSinceLastUpdate = (new Date() - this.progress.lastUpdated) / (1000 * 60 * 60 * 24);
  if (daysSinceLastUpdate > 0) {
    const dailyProgress = amount / daysSinceLastUpdate;
    this.progress.velocityPerMonth = dailyProgress * 30;
  }
  
  // Add note if provided
  if (note) {
    this.notes.push({
      content: note,
      type: 'progress'
    });
  }
  
  return this.save();
};

goalSchema.methods.checkMilestones = function() {
  const achievedMilestones = [];
  
  this.smart.timeBound.milestones.forEach(milestone => {
    if (!milestone.achieved && this.smart.measurable.currentValue >= milestone.targetValue) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
      milestone.actualValue = this.smart.measurable.currentValue;
      
      achievedMilestones.push(milestone);
    }
  });
  
  return achievedMilestones;
};

goalSchema.methods.generateInsights = function() {
  const insights = [];
  
  // Check if behind schedule
  if (!this.isOnTrack && this.status === 'active') {
    insights.push({
      type: 'behind_schedule',
      message: `You're ${Math.abs(this.progress.percentage - this.timeProgress).toFixed(1)}% behind schedule`,
      severity: 'warning',
      actionable: true
    });
  }
  
  // Check if milestone is approaching
  const nextMilestone = this.smart.timeBound.milestones
    .filter(m => !m.achieved)
    .sort((a, b) => a.targetValue - b.targetValue)[0];
    
  if (nextMilestone) {
    const progressToMilestone = (this.smart.measurable.currentValue / nextMilestone.targetValue) * 100;
    if (progressToMilestone >= 80) {
      insights.push({
        type: 'milestone_approaching',
        message: `You're ${progressToMilestone.toFixed(1)}% of the way to your next milestone`,
        severity: 'info',
        actionable: false
      });
    }
  }
  
  // Check for adjustment opportunities
  if (this.progress.velocityPerMonth && this.smart.achievable.monthlyContribution) {
    const efficiency = (this.progress.velocityPerMonth / this.smart.achievable.monthlyContribution) * 100;
    if (efficiency < 80) {
      insights.push({
        type: 'optimization_opportunity',
        message: `Your progress efficiency is ${efficiency.toFixed(1)}%. Consider reviewing your strategy.`,
        severity: 'warning',
        actionable: true
      });
    }
  }
  
  this.analytics.insights = insights;
  return insights;
};

// Static methods
goalSchema.statics.getActiveGoals = function(userId) {
  return this.find({ 
    userId, 
    status: 'active' 
  }).sort({ priority: -1, 'smart.timeBound.targetDate': 1 });
};

goalSchema.statics.getGoalsSummary = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTarget: { $sum: '$smart.measurable.targetValue' },
        totalProgress: { $sum: '$smart.measurable.currentValue' }
      }
    }
  ]);
};

goalSchema.statics.getDueForUpdate = function() {
  return this.find({
    status: 'active',
    'automation.enabled': true,
    'automation.nextContribution': { $lte: new Date() }
  });
};

module.exports = mongoose.model('Goal', goalSchema);