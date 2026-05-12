const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
db.pool.connect()
  .then(() => console.log('PostgreSQL (Neon) connected successfully'))
  .catch(err => console.error('PostgreSQL connection error:', err));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
