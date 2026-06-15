const express = require('express');
const { body } = require('express-validator');
const Mark = require('../models/Mark');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize, authorizeOwnerOrRoles } = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');

const router = express.Router();

const canViewStudentData = authorizeOwnerOrRoles('teacher', 'admin');

// Get student marks
router.get('/student/:studentId', auth, canViewStudentData('studentId'), asyncHandler(async (req, res) => {
  const marks = await Mark.findByStudentId(req.params.studentId);
  res.json({ marks });
}));

// Add new mark (teacher only)
router.post('/', [
  auth,
  authorize('teacher', 'admin'),
  body('studentId').isInt().withMessage('Invalid student ID'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('testType').isIn(['quiz', 'exam', 'assignment', 'project']).withMessage('Invalid test type'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  validate
], asyncHandler(async (req, res) => {
  const { studentId, subject, testType, score, maxScore, semester, academicYear, comments } = req.body;

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }

  const mark = await Mark.create({
    studentId: parseInt(studentId),
    teacherId: req.user.userId,
    subject,
    testType,
    score: parseInt(score),
    maxScore: parseInt(maxScore) || 100,
    semester,
    academicYear,
    comments
  });

  res.status(201).json({ message: 'Mark added successfully', mark });
}));

// Update mark (teacher only)
router.put('/:markId', [
  auth,
  authorize('teacher', 'admin'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  validate
], asyncHandler(async (req, res) => {
  const { markId } = req.params;
  const { score, comments } = req.body;

  const mark = await Mark.findById(markId);
  if (!mark) {
    return res.status(404).json({ message: 'Mark not found' });
  }

  if (req.user.role !== 'admin' && mark.teacher_id !== req.user.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const updatedMark = await Mark.update(markId, { score: parseInt(score), comments });
  res.json({ message: 'Mark updated successfully', mark: updatedMark });
}));

// Delete mark (teacher only)
router.delete('/:markId', auth, authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const { markId } = req.params;

  const mark = await Mark.findById(markId);
  if (!mark) {
    return res.status(404).json({ message: 'Mark not found' });
  }

  if (req.user.role !== 'admin' && mark.teacher_id !== req.user.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await Mark.delete(markId);
  res.json({ message: 'Mark deleted successfully' });
}));

module.exports = router;
