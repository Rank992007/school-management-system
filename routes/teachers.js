const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all teachers (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const teachers = await User.findAll('teacher');
    res.json({ teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific teacher
router.get('/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if user is authorized to view this teacher
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(teacherId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ teacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
