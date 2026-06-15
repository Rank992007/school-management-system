const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize, authorizeOwnerOrRoles } = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const canViewTeacherData = authorizeOwnerOrRoles('admin');

// Get all teachers (admin only)
router.get('/', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const teachers = await User.findAll('teacher');
  res.json({ teachers });
}));

// Get specific teacher
router.get('/:teacherId', auth, canViewTeacherData('teacherId'), asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  res.json({ teacher });
}));

module.exports = router;
