const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all students (teacher/admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const students = await User.findAll('student');
    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific student
router.get('/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if user is authorized to view this student
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.userId !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
