const bcrypt = require('bcryptjs');
const db = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, password, role, firstName, lastName, dateOfBirth, grade, subject } = userData;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (username, email, password, role, first_name, last_name, date_of_birth, grade, subject)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, username, email, role, first_name, last_name, date_of_birth, grade, subject, created_at
    `;
    
    const values = [username, email, hashedPassword, role, firstName, lastName, dateOfBirth, grade, subject];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, role, first_name, last_name, date_of_birth, grade, subject, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(role = null) {
    let query = 'SELECT id, username, email, role, first_name, last_name, date_of_birth, grade, subject, created_at FROM users';
    let params = [];
    
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateVerificationCode(userId, code, expiresAt) {
    const query = `
      UPDATE users
      SET verification_code = $1, verification_code_expires_at = $2
      WHERE id = $3
      RETURNING id, email
    `;
    const result = await db.query(query, [code, expiresAt, userId]);
    return result.rows[0];
  }

  static async verifyEmail(code) {
    const query = `
      UPDATE users
      SET is_verified = TRUE, verification_code = NULL, verification_code_expires_at = NULL
      WHERE verification_code = $1
        AND verification_code_expires_at > CURRENT_TIMESTAMP
      RETURNING id, username, email, role, first_name, last_name
    `;
    const result = await db.query(query, [code]);
    return result.rows[0];
  }

  static async findByVerificationCode(code) {
    const query = `
      SELECT id, username, email, verification_code_expires_at
      FROM users
      WHERE verification_code = $1
      AND verification_code_expires_at > CURRENT_TIMESTAMP
    `;
    const result = await db.query(query, [code]);
    return result.rows[0];
  }
}

module.exports = User;
