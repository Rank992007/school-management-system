const db = require('../config/database');

class Bulletin {
  static async create(bulletinData) {
    const { studentId, semester, academicYear, subjects, overallAverage, grade, attendance, generatedBy } = bulletinData;
    
    try {
      // Start transaction
      await db.query('BEGIN');
      
      // Create bulletin
      const bulletinQuery = `
        INSERT INTO bulletins (student_id, semester, academic_year, overall_average, grade, total_days, present_days, attendance_percentage, generated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const bulletinValues = [
        studentId, 
        semester, 
        academicYear, 
        overallAverage || 0, 
        grade || 'F', 
        attendance?.totalDays || 0, 
        attendance?.presentDays || 0, 
        attendance?.percentage || 0, 
        generatedBy
      ];
      
      const bulletinResult = await db.query(bulletinQuery, bulletinValues);
      const bulletin = bulletinResult.rows[0];
      
      // Create bulletin subjects
      for (const subject of subjects) {
        const subjectQuery = `
          INSERT INTO bulletin_subjects (bulletin_id, subject_name, teacher_name, average_score)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        const subjectValues = [bulletin.id, subject.subjectName, subject.teacherName, subject.averageScore || 0];
        const subjectResult = await db.query(subjectQuery, subjectValues);
        const bulletinSubject = subjectResult.rows[0];
        
        // Create bulletin marks for this subject
        for (const mark of subject.marks) {
          const markQuery = `
            INSERT INTO bulletin_marks (bulletin_subject_id, test_type, score, max_score, date)
            VALUES ($1, $2, $3, $4, $5)
          `;
          
          const markValues = [
            bulletinSubject.id,
            mark.testType,
            mark.score,
            mark.maxScore,
            mark.date
          ];
          
          await db.query(markQuery, markValues);
        }
      }
      
      await db.query('COMMIT');
      
      // Return the complete bulletin with all related data
      return await this.findById(bulletin.id);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    const query = `
      SELECT b.*, 
             u.first_name as student_first_name, u.last_name as student_last_name,
             g.first_name as generator_first_name, g.last_name as generator_last_name
      FROM bulletins b
      JOIN users u ON b.student_id = u.id
      JOIN users g ON b.generated_by = g.id
      WHERE b.student_id = $1
      ORDER BY b.generated_at DESC
    `;
    
    try {
      const result = await db.query(query, [studentId]);
      const bulletins = result.rows;
      
      // Get subjects and marks for each bulletin
      for (const bulletin of bulletins) {
        bulletin.subjects = await this.getBulletinSubjects(bulletin.id);
      }
      
      return bulletins;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT b.*, 
             u.first_name as student_first_name, u.last_name as student_last_name,
             g.first_name as generator_first_name, g.last_name as generator_last_name
      FROM bulletins b
      JOIN users u ON b.student_id = u.id
      JOIN users g ON b.generated_by = g.id
      WHERE b.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      const bulletin = result.rows[0];
      bulletin.subjects = await this.getBulletinSubjects(bulletin.id);
      
      return bulletin;
    } catch (error) {
      throw error;
    }
  }

  static async getBulletinSubjects(bulletinId) {
    const subjectsQuery = `
      SELECT * FROM bulletin_subjects
      WHERE bulletin_id = $1
    `;
    
    try {
      const subjectsResult = await db.query(subjectsQuery, [bulletinId]);
      const subjects = subjectsResult.rows;
      
      // Get marks for each subject
      for (const subject of subjects) {
        const marksQuery = `
          SELECT * FROM bulletin_marks
          WHERE bulletin_subject_id = $1
        `;
        
        const marksResult = await db.query(marksQuery, [subject.id]);
        subject.marks = marksResult.rows;
      }
      
      return subjects;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Bulletin;
