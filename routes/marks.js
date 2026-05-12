const express = require('express');
const { body, validationResult } = require('express-validator');
const Mark = require('../models/Mark');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get student marks
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user is authorized to view these marks
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.userId !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const marks = await Mark.findByStudentId(studentId);
    res.json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new mark (teacher only)
router.post('/', [
  auth,
  body('studentId').isInt().withMessage('Invalid student ID'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('testType').isIn(['quiz', 'exam', 'assignment', 'project']).withMessage('Invalid test type'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
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

    const { studentId, subject, testType, score, maxScore, semester, academicYear, comments } = req.body;

    // Verify student exists
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mark (teacher only)
router.put('/:markId', [
  auth,
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { markId } = req.params;
    const { score, comments } = req.body;

    const mark = await Mark.findById(markId);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }

    // Check if teacher owns this mark or is admin
    if (req.user.role !== 'admin' && mark.teacher_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedMark = await Mark.update(markId, { score: parseInt(score), comments });
    res.json({ message: 'Mark updated successfully', mark: updatedMark });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete mark (teacher only)
router.delete('/:markId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { markId } = req.params;

    const mark = await Mark.findById(markId);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }

    // Check if teacher owns this mark or is admin
    if (req.user.role !== 'admin' && mark.teacher_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Mark.delete(markId);
    res.json({ message: 'Mark deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
