const express = require('express');
const { body, validationResult } = require('express-validator');
const Claim = require('../models/Claim');
const Mark = require('../models/Mark');
const auth = require('../middleware/auth');

const router = express.Router();

// Get claims for student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user is authorized to view these claims
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.userId !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const claims = await Claim.findByStudentId(studentId);
    
    res.json({ claims });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims for teachers/admins
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const claims = await Claim.findAll();
    
    res.json({ claims });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit new claim (student only)
router.post('/', [
  auth,
  body('markId').isInt().withMessage('Invalid mark ID'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { markId, title, description } = req.body;

    // Verify mark exists and belongs to this student
    const mark = await Mark.findById(markId);
    if (!mark || mark.student_id !== req.user.userId) {
      return res.status(404).json({ message: 'Mark not found or unauthorized' });
    }

    const claim = await Claim.create({
      studentId: req.user.userId,
      markId: parseInt(markId),
      title,
      description
    });

    res.status(201).json({ message: 'Claim submitted successfully', claim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review claim (teacher/admin only)
router.put('/:claimId/review', [
  auth,
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('reviewComments').trim().notEmpty().withMessage('Review comments are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { claimId } = req.params;
    const { status, reviewComments } = req.body;

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    const updatedClaim = await Claim.updateReview(claimId, status, req.user.userId, reviewComments);

    res.json({ message: `Claim ${status} successfully`, claim: updatedClaim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
