const express = require('express');
const { body } = require('express-validator');
const Bulletin = require('../models/Bulletin');
const Mark = require('../models/Mark');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize, authorizeOwnerOrRoles } = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');

const router = express.Router();

const canViewStudentData = authorizeOwnerOrRoles('teacher', 'admin');

// Get student bulletins
router.get('/student/:studentId', auth, canViewStudentData('studentId'), asyncHandler(async (req, res) => {
  const bulletins = await Bulletin.findByStudentId(req.params.studentId);
  res.json({ bulletins });
}));

// Generate new bulletin (teacher/admin only)
router.post('/', [
  auth,
  authorize('teacher', 'admin'),
  body('studentId').isInt().withMessage('Invalid student ID'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  validate
], asyncHandler(async (req, res) => {
  const { studentId, semester, academicYear } = req.body;

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }

  const marks = await Mark.findByStudentId(studentId);
  const filteredMarks = marks.filter(mark => 
    mark.semester === semester && mark.academic_year === academicYear
  );

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

  const subjects = Object.values(subjectGroups).map(subject => {
    const totalScore = subject.marks.reduce((sum, mark) => sum + mark.score, 0);
    const totalMaxScore = subject.marks.reduce((sum, mark) => sum + mark.maxScore, 0);
    subject.averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    return subject;
  });

  const overallAverage = subjects.length > 0 
    ? subjects.reduce((sum, subject) => sum + subject.averageScore, 0) / subjects.length 
    : 0;

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
}));

// Get specific bulletin
router.get('/:bulletinId', auth, asyncHandler(async (req, res) => {
  const bulletin = await Bulletin.findById(req.params.bulletinId);

  if (!bulletin) {
    return res.status(404).json({ message: 'Bulletin not found' });
  }

  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && bulletin.student_id !== req.user.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  res.json({ bulletin });
}));

module.exports = router;
