const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'budgeting-app' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Security audit logs
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Create specialized logging methods
logger.security = (message, meta = {}) => {
  logger.warn(message, { 
    type: 'SECURITY',
    timestamp: new Date().toISOString(),
    ...meta 
  });
};

logger.audit = (action, userId, details = {}) => {
  logger.info('User Action', {
    type: 'AUDIT',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.performance = (operation, duration, meta = {}) => {
  logger.info('Performance Metric', {
    type: 'PERFORMANCE',
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

logger.financial = (action, userId, amount, details = {}) => {
  logger.info('Financial Action', {
    type: 'FINANCIAL',
    action,
    userId,
    amount,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.ml = (operation, accuracy, details = {}) => {
  logger.info('ML Operation', {
    type: 'MACHINE_LEARNING',
    operation,
    accuracy,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Database operation logging
logger.db = (operation, collection, query, duration, meta = {}) => {
  logger.debug('Database Operation', {
    type: 'DATABASE',
    operation,
    collection,
    query: JSON.stringify(query),
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// API request logging
logger.api = (method, url, statusCode, duration, userId, meta = {}) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger.log(level, 'API Request', {
    type: 'API',
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    userId,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Business logic logging
logger.business = (event, userId, details = {}) => {
  logger.info('Business Event', {
    type: 'BUSINESS',
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Error with context
logger.errorWithContext = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    ...context
  });
};

// Validation error logging
logger.validation = (field, value, rule, userId, meta = {}) => {
  logger.warn('Validation Error', {
    type: 'VALIDATION',
    field,
    value: typeof value === 'string' ? value.substring(0, 100) : value,
    rule,
    userId,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Rate limiting logs
logger.rateLimit = (ip, endpoint, attempts, meta = {}) => {
  logger.warn('Rate Limit Hit', {
    type: 'RATE_LIMIT',
    ip,
    endpoint,
    attempts,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Authentication logs
logger.auth = (event, userId, ip, userAgent, meta = {}) => {
  logger.info('Authentication Event', {
    type: 'AUTHENTICATION',
    event,
    userId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Transaction processing logs
logger.transaction = (event, transactionId, userId, amount, meta = {}) => {
  logger.info('Transaction Event', {
    type: 'TRANSACTION',
    event,
    transactionId,
    userId,
    amount,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Budget alerts
logger.budgetAlert = (type, userId, category, percentage, meta = {}) => {
  logger.warn('Budget Alert', {
    type: 'BUDGET_ALERT',
    alertType: type,
    userId,
    category,
    percentage,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Goal tracking
logger.goal = (event, goalId, userId, progress, meta = {}) => {
  logger.info('Goal Event', {
    type: 'GOAL',
    event,
    goalId,
    userId,
    progress,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Data export/import
logger.dataOperation = (operation, userId, recordCount, meta = {}) => {
  logger.info('Data Operation', {
    type: 'DATA_OPERATION',
    operation,
    userId,
    recordCount,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Report generation
logger.report = (reportType, userId, parameters, generationTime, meta = {}) => {
  logger.info('Report Generated', {
    type: 'REPORT',
    reportType,
    userId,
    parameters,
    generationTime: `${generationTime}ms`,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

module.exports = logger;