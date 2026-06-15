const express = require('express');
const { body, validationResult } = require('express-validator');
const Bulletin = require('../models/Bulletin');
const Mark = require('../models/Mark');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get student bulletins
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user is authorized to view these bulletins
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.userId !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const bulletins = await Bulletin.findByStudentId(studentId);
    
    res.json({ bulletins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new bulletin (teacher/admin only)
router.post('/', [
  auth,
  body('studentId').isInt().withMessage('Invalid student ID'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { studentId, semester, academicYear } = req.body;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all marks for the student in the specified semester/year
    const marks = await Mark.findByStudentId(studentId);
    const filteredMarks = marks.filter(mark => 
      mark.semester === semester && mark.academic_year === academicYear
    );

    // Group marks by subject
    const subjectGroups = {};
    filteredMarks.forEach(mark => {
      if (!subjectGroups[mark.subject]) {
        subjectGroups[mark.subject] = {
          subjectName: mark.subject,
          teacherName: `${mark.teacher_first_name} ${mark.teacher_last_name}`,
          marks: []
        };
      }
      subjectGroups[mark.subject].marks.push({
        testType: mark.test_type,
        score: mark.score,
        maxScore: mark.max_score,
        date: mark.date
      });
    });

    // Calculate averages for each subject
    const subjects = Object.values(subjectGroups).map(subject => {
      const totalScore = subject.marks.reduce((sum, mark) => sum + mark.score, 0);
      const totalMaxScore = subject.marks.reduce((sum, mark) => sum + mark.maxScore, 0);
      subject.averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      return subject;
    });

    // Calculate overall average
    const overallAverage = subjects.length > 0 
      ? subjects.reduce((sum, subject) => sum + subject.averageScore, 0) / subjects.length 
      : 0;

    // Determine grade
    let grade = 'F';
    if (overallAverage >= 90) grade = 'A';
    else if (overallAverage >= 80) grade = 'B';
    else if (overallAverage >= 70) grade = 'C';
    else if (overallAverage >= 60) grade = 'D';

    const bulletin = await Bulletin.create({
      studentId: parseInt(studentId),
      semester,
      academicYear,
      subjects,
      overallAverage,
      grade,
      attendance: {
        totalDays: 0,
        presentDays: 0,
        percentage: 0
      },
      generatedBy: req.user.userId
    });

    res.status(201).json({ message: 'Bulletin generated successfully', bulletin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific bulletin
router.get('/:bulletinId', auth, async (req, res) => {
  try {
    const { bulletinId } = req.params;

    const bulletin = await Bulletin.findById(bulletinId);

    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin not found' });
    }

    // Check if user is authorized to view this bulletin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && bulletin.student_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ bulletin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
