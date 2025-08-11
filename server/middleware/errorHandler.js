const logger = require('../utils/logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, code = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  const startTime = Date.now();
  
  // Set default error values
  let err = { ...error };
  err.message = error.message;

  // Log error with context
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    statusCode: error.statusCode || 500,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  // Handle different types of errors
  if (error.name === 'CastError') {
    err = handleCastErrorDB(error);
  } else if (error.code === 11000) {
    err = handleDuplicateFieldsDB(error);
  } else if (error.name === 'ValidationError') {
    err = handleValidationErrorDB(error);
  } else if (error.name === 'JsonWebTokenError') {
    err = handleJWTError(error);
  } else if (error.name === 'TokenExpiredError') {
    err = handleJWTExpiredError(error);
  } else if (error.name === 'MulterError') {
    err = handleMulterError(error);
  } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
    err = handleMongoError(error);
  }

  // Log appropriate level based on error type
  if (err.statusCode >= 500) {
    logger.errorWithContext(error, errorContext);
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error', errorContext);
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    err.message = 'Something went wrong!';
    err.code = 'INTERNAL_ERROR';
  }

  // Financial operation specific logging
  if (isFinancialOperation(req)) {
    logger.financial('error_in_financial_operation', req.userId, 0, {
      operation: req.path,
      error: err.message,
      statusCode: err.statusCode
    });
  }

  // Security incident logging
  if (isSecurityIncident(error, req)) {
    logger.security('Security incident detected', {
      ...errorContext,
      incidentType: getIncidentType(error),
      severity: getSeverity(error)
    });
  }

  // Send error response
  const response = {
    status: err.status || 'error',
    message: err.message,
    code: err.code || 'UNKNOWN_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    }),
    ...(err.field && { field: err.field }),
    timestamp: new Date().toISOString(),
    requestId: req.requestId || generateRequestId()
  };

  // Add specific error details
  if (err.statusCode === 429) {
    response.retryAfter = err.retryAfter || 3600;
  }

  if (err.statusCode === 402) {
    response.upgradeUrl = '/upgrade';
  }

  // Performance logging
  logger.performance('error_handling', Date.now() - startTime, {
    statusCode: err.statusCode,
    errorType: err.constructor.name
  });

  res.status(err.statusCode || 500).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Specific error handlers
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ValidationError(message, err.path);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new ConflictError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message,
    value: el.value
  }));
  
  const message = 'Invalid input data';
  const validationError = new ValidationError(message);
  validationError.errors = errors;
  return validationError;
};

const handleJWTError = () => {
  return new AuthenticationError('Invalid token. Please log in again!');
};

const handleJWTExpiredError = () => {
  return new AuthenticationError('Your token has expired! Please log in again.');
};

const handleMulterError = (err) => {
  let message = 'File upload error';
  
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large. Maximum size is 10MB.';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded.';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field.';
      break;
    default:
      message = err.message;
  }
  
  return new ValidationError(message);
};

const handleMongoError = (err) => {
  let message = 'Database operation failed';
  
  if (err.code === 11000) {
    return handleDuplicateFieldsDB(err);
  }
  
  if (err.message.includes('timeout')) {
    message = 'Database timeout. Please try again.';
  }
  
  return new DatabaseError(message);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.errorWithContext(err, {
    type: 'unhandledRejection',
    promise: promise.toString()
  });
  
  // Close server gracefully
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.errorWithContext(err, {
    type: 'uncaughtException'
  });
  
  // Close server gracefully
  process.exit(1);
});

// Helper functions
function sanitizeBody(body) {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'confirmPassword', 'currentPassword', 'token', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function isFinancialOperation(req) {
  const financialPaths = [
    '/api/transactions',
    '/api/budgets',
    '/api/goals',
    '/api/investments',
    '/api/reports'
  ];
  
  return financialPaths.some(path => req.path.startsWith(path));
}

function isSecurityIncident(error, req) {
  const securityIndicators = [
    'Invalid token',
    'Authentication failed',
    'Unauthorized',
    'Too many requests',
    'SQL injection',
    'XSS attempt',
    'CSRF'
  ];
  
  return securityIndicators.some(indicator => 
    error.message.toLowerCase().includes(indicator.toLowerCase())
  ) || error.statusCode === 401 || error.statusCode === 403;
}

function getIncidentType(error) {
  if (error.statusCode === 401) return 'authentication_failure';
  if (error.statusCode === 403) return 'authorization_failure';
  if (error.statusCode === 429) return 'rate_limit_exceeded';
  if (error.message.includes('injection')) return 'injection_attempt';
  return 'unknown_security_incident';
}

function getSeverity(error) {
  if (error.statusCode >= 500) return 'high';
  if (error.statusCode === 401 || error.statusCode === 403) return 'medium';
  return 'low';
}

function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Not found handler (should be last middleware)
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId
  });
  
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  DatabaseError,
  ExternalServiceError
};