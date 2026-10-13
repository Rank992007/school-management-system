const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
db.pool.query('SELECT 1')
  .then(() => console.log('PostgreSQL (Neon) connected successfully'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/bulletins', require('./routes/bulletins'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'School Management System API is running' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

const clientBuildPath = path.join(__dirname, 'client', 'build');
const clientIndexPath = path.join(clientBuildPath, 'index.html');

app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath, (error) => {
      if (error) next(error);
    });
  }

  if (req.path === '/') {
    return res.json({ message: 'School Management System API is running' });
  }

  return res.status(404).send('Frontend build not found. Run npm run build first.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
