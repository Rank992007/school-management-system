const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/auth', require('../routes/auth'));
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

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Export for Vercel serverless function
module.exports = app;
