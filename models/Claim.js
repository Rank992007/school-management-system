const db = require('../config/database');

class Claim {
  static async create(claimData) {
    const { studentId, markId, title, description } = claimData;
    
    const query = `
      INSERT INTO claims (student_id, mark_id, title, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [studentId, markId, title, description];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    const query = `
      SELECT c.*, 
             m.subject, m.score, m.test_type,
             u.first_name as reviewer_first_name, u.last_name as reviewer_last_name
      FROM claims c
      JOIN marks m ON c.mark_id = m.id
      LEFT JOIN users u ON c.reviewed_by = u.id
      WHERE c.student_id = $1
      ORDER BY c.submitted_at DESC
    `;
    
    try {
      const result = await db.query(query, [studentId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const query = `
      SELECT c.*, 
             s.first_name as student_first_name, s.last_name as student_last_name,
             m.subject, m.score, m.test_type,
             u.first_name as reviewer_first_name, u.last_name as reviewer_last_name
      FROM claims c
      JOIN users s ON c.student_id = s.id
      JOIN marks m ON c.mark_id = m.id
      LEFT JOIN users u ON c.reviewed_by = u.id
      ORDER BY c.submitted_at DESC
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             s.first_name as student_first_name, s.last_name as student_last_name,
             m.subject, m.score, m.test_type,
             u.first_name as reviewer_first_name, u.last_name as reviewer_last_name
      FROM claims c
      JOIN users s ON c.student_id = s.id
      JOIN marks m ON c.mark_id = m.id
      LEFT JOIN users u ON c.reviewed_by = u.id
      WHERE c.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateReview(id, status, reviewedBy, reviewComments) {
    const query = `
      UPDATE claims 
      SET status = $1, reviewed_by = $2, review_comments = $3, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [status, reviewedBy, reviewComments, id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Claim;
