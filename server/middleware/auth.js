const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    // Check if no token
    if (!token) {
      logger.security('Access attempt without token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method
      });
      
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        code: 'NO_TOKEN' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('+loginAttempts +lockUntil');
      
      if (!user) {
        logger.security('Token with invalid user ID', {
          userId: decoded.userId,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path
        });
        
        return res.status(401).json({ 
          message: 'Token is not valid - user not found',
          code: 'INVALID_USER' 
        });
      }

      // Check if user account is locked
      if (user.isLocked) {
        logger.security('Access attempt from locked account', {
          userId: user._id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          lockUntil: user.lockUntil
        });
        
        return res.status(423).json({ 
          message: 'Account is temporarily locked due to too many failed login attempts',
          code: 'ACCOUNT_LOCKED',
          lockUntil: user.lockUntil 
        });
      }

      // Check if email is verified for sensitive operations
      if (!user.emailVerified && isSensitiveOperation(req)) {
        logger.security('Unverified user attempting sensitive operation', {
          userId: user._id,
          ip: req.ip,
          endpoint: req.path,
          method: req.method
        });
        
        return res.status(403).json({ 
          message: 'Email verification required for this operation',
          code: 'EMAIL_NOT_VERIFIED' 
        });
      }

      // Check subscription limits for premium features
      if (isPremiumFeature(req) && user.subscriptionTier === 'free') {
        logger.business('Free user attempting premium feature', user._id, {
          endpoint: req.path,
          method: req.method
        });
        
        return res.status(402).json({ 
          message: 'Premium subscription required for this feature',
          code: 'PREMIUM_REQUIRED' 
        });
      }

      // Update user's last activity
      user.usageStats.lastLogin = new Date();
      await user.save();

      // Add user to request object
      req.user = user;
      req.userId = user._id;

      // Log successful authentication
      logger.auth('token_verified', user._id, req.ip, req.get('User-Agent'), {
        endpoint: req.path,
        method: req.method,
        duration: Date.now() - startTime
      });

      next();

    } catch (jwtError) {
      logger.security('Invalid JWT token', {
        error: jwtError.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        token: token.substring(0, 20) + '...' // Log partial token for debugging
      });

      let message = 'Token is not valid';
      let code = 'INVALID_TOKEN';

      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token has expired';
        code = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Invalid token format';
        code = 'MALFORMED_TOKEN';
      }

      return res.status(401).json({ message, code });
    }

  } catch (error) {
    logger.errorWithContext(error, {
      middleware: 'auth',
      userId: req.userId,
      ip: req.ip,
      endpoint: req.path,
      method: req.method
    });

    res.status(500).json({ 
      message: 'Server error during authentication',
      code: 'AUTH_SERVER_ERROR' 
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && !user.isLocked) {
      req.user = user;
      req.userId = user._id;
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed', { error: error.message });
  }

  next();
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED' 
    });
  }

  if (req.user.role !== 'admin') {
    logger.security('Non-admin user attempting admin action', {
      userId: req.user._id,
      role: req.user.role,
      ip: req.ip,
      endpoint: req.path,
      method: req.method
    });

    return res.status(403).json({ 
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED' 
    });
  }

  next();
};

// Premium subscription middleware
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED' 
    });
  }

  if (req.user.subscriptionTier === 'free') {
    logger.business('Free user blocked from premium feature', req.user._id, {
      endpoint: req.path,
      method: req.method,
      subscriptionTier: req.user.subscriptionTier
    });

    return res.status(402).json({ 
      message: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED' 
    });
  }

  next();
};

// Rate limiting per user
const rateLimitByUser = (maxRequests = 100, windowMinutes = 15) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.userId) {
      return next();
    }

    const userId = req.userId.toString();
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRequests.get(userId);

    if (now > userLimit.resetTime) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      logger.rateLimit(req.ip, req.path, userLimit.count, {
        userId,
        windowMinutes,
        maxRequests
      });

      return res.status(429).json({
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};

// Validate API key for external integrations
const validateApiKey = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ 
      message: 'API key required',
      code: 'API_KEY_REQUIRED' 
    });
  }

  try {
    // In production, store API keys in database with proper hashing
    const user = await User.findOne({ 'apiKeys.key': apiKey, 'apiKeys.active': true });
    
    if (!user) {
      logger.security('Invalid API key used', {
        apiKey: apiKey.substring(0, 8) + '...',
        ip: req.ip,
        endpoint: req.path
      });
      
      return res.status(401).json({ 
        message: 'Invalid API key',
        code: 'INVALID_API_KEY' 
      });
    }

    req.user = user;
    req.userId = user._id;
    req.isApiRequest = true;

    // Log API usage
    logger.api(req.method, req.path, 200, 0, user._id, {
      apiKey: apiKey.substring(0, 8) + '...',
      source: 'api'
    });

    next();
  } catch (error) {
    logger.errorWithContext(error, {
      middleware: 'apiKey',
      endpoint: req.path
    });

    res.status(500).json({ 
      message: 'Server error during API key validation',
      code: 'API_KEY_SERVER_ERROR' 
    });
  }
};

// Helper functions
function isSensitiveOperation(req) {
  const sensitivePaths = [
    '/api/users/profile',
    '/api/users/password',
    '/api/users/delete',
    '/api/transactions/export',
    '/api/reports/tax',
    '/api/goals/delete'
  ];
  
  const sensitiveMethods = ['DELETE', 'PUT'];
  
  return sensitivePaths.some(path => req.path.startsWith(path)) || 
         sensitiveMethods.includes(req.method);
}

function isPremiumFeature(req) {
  const premiumPaths = [
    '/api/analytics/advanced',
    '/api/reports/custom',
    '/api/investments',
    '/api/goals/advanced',
    '/api/transactions/categorize/ml',
    '/api/budgets/templates',
    '/api/exports/advanced'
  ];
  
  return premiumPaths.some(path => req.path.startsWith(path));
}

module.exports = {
  authMiddleware,
  optionalAuth,
  requireAdmin,
  requirePremium,
  rateLimitByUser,
  validateApiKey
};