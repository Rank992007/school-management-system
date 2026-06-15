const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const db = require('../config/database');

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to known origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Import routes
app.use('/api/auth', authLimiter, require('../routes/auth'));
app.use('/api/students', require('../routes/students'));
app.use('/api/teachers', require('../routes/teachers'));
app.use('/api/marks', require('../routes/marks'));
app.use('/api/claims', require('../routes/claims'));
app.use('/api/bulletins', require('../routes/bulletins'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'School Management System API is running' });
});

// Export for Vercel serverless function
module.exports = app;
