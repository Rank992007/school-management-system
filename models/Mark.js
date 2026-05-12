const db = require('../config/database');

class Mark {
  static async create(markData) {
    const { studentId, teacherId, subject, testType, score, maxScore, semester, academicYear, comments } = markData;
    
    const query = `
      INSERT INTO marks (student_id, teacher_id, subject, test_type, score, max_score, semester, academic_year, comments)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [studentId, teacherId, subject, testType, score, maxScore || 100, semester, academicYear, comments];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    const query = `
      SELECT m.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM marks m
      JOIN users u ON m.teacher_id = u.id
      WHERE m.student_id = $1
      ORDER BY m.date DESC
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
      SELECT m.*, 
             s.first_name as student_first_name, s.last_name as student_last_name,
             t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM marks m
      JOIN users s ON m.student_id = s.id
      JOIN users t ON m.teacher_id = t.id
      ORDER BY m.date DESC
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
      SELECT m.*, 
             s.first_name as student_first_name, s.last_name as student_last_name,
             t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM marks m
      JOIN users s ON m.student_id = s.id
      JOIN users t ON m.teacher_id = t.id
      WHERE m.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    const { score, comments } = updateData;
    
    const query = `
      UPDATE marks 
      SET score = $1, comments = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const values = [score, comments, id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM marks WHERE id = $1 RETURNING *';
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Mark;
