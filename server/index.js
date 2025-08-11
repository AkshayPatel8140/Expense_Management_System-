const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const goalRoutes = require('./routes/goals');
const categoryRoutes = require('./routes/categories');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const billRoutes = require('./routes/bills');
const investmentRoutes = require('./routes/investments');

// Import middleware
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
}));

// Other middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Optional auth middleware for demo purposes
const optionalAuth = (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }
  // Continue without authentication for demo
  next();
};

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', optionalAuth, userRoutes);
app.use('/api/transactions', optionalAuth, transactionRoutes);
app.use('/api/budgets', optionalAuth, budgetRoutes);
app.use('/api/goals', optionalAuth, goalRoutes);
app.use('/api/categories', optionalAuth, categoryRoutes);
app.use('/api/reports', optionalAuth, reportRoutes);
app.use('/api/analytics', optionalAuth, analyticsRoutes);
app.use('/api/bills', optionalAuth, billRoutes);
app.use('/api/investments', optionalAuth, investmentRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;