const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');
const challengeRoutes = require('./routes/challenges');
const rewardRoutes = require('./routes/rewards');
const mockMiddleware = require('./middleware/mock');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mockMode: app.get('mockMode') || false });
});

// Use Mock Middleware
app.use(mockMiddleware(app));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/rewards', rewardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database connection function with fallback
const connectDB = async () => {
  // Disable buffering globally so Mongoose fails fast when disconnected
  mongoose.set('bufferCommands', false);
  
  const uris = [process.env.MONGODB_URI, process.env.LOCAL_MONGODB_URI].filter(Boolean);
  
  if (uris.length === 0) {
    console.error('❌ ERROR: No MongoDB URI found in environment variables.');
    return false;
  }

  for (const uri of uris) {
    try {
      console.log(`🔌 Attempting connection to: ${uri.split('@').pop().split('?')[0]}...`);
      await mongoose.connect(uri, { 
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected: ${uri.includes('mongodb.net') ? 'Atlas Cluster' : 'Local Instance'}`);
      return true;
    } catch (err) {
      const sanitizedUri = uri.split('@').pop();
      console.error(`❌ Connection failed for ${sanitizedUri}:`, err.message);
      
      if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
        console.warn('💡 TIP: This often means your IP address is not whitelisted in MongoDB Atlas or your DNS blocks SRV records.');
        console.warn('👉 Check "Network Access" in your Atlas dashboard and ensure "Allow Access From Anywhere" (0.0.0.0/0) is enabled for testing.');
      }
    }
  }
  return false;
};

connectDB().then((success) => {
  const PORT = process.env.PORT || 5000;
  
  if (success) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } else {
    console.warn('⚠️  WARNING: Could not connect to MongoDB. Starting in MOCK MODE.');
    console.log('💡 This mode allows exploring the UI, but data will reset on server restart.');
    
    // Toggle mock mode flag if needed by routes (optional logic)
    app.set('mockMode', true);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in MOCK MODE on port ${PORT}`);
    });
  }
});

module.exports = app;
