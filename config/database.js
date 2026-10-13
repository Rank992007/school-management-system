require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (error) => {
  console.error('PostgreSQL idle client error:', error.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
