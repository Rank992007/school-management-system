const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize, authorizeOwnerOrRoles } = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const canViewStudentData = authorizeOwnerOrRoles('teacher', 'admin');

// Get all students (teacher/admin only)
router.get('/', auth, authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const students = await User.findAll('student');
  res.json({ students });
}));

// Get specific student
router.get('/:studentId', auth, canViewStudentData('studentId'), asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json({ student });
}));

module.exports = router;
