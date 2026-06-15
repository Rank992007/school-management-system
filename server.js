const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/bulletins', require('./routes/bulletins'));

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

// Database Connection — verify before accepting traffic
db.pool.connect()
  .then((client) => {
    client.release();
    console.log('PostgreSQL (Neon) connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  });
