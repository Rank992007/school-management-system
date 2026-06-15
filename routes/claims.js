const express = require('express');
const { body } = require('express-validator');
const Claim = require('../models/Claim');
const Mark = require('../models/Mark');
const auth = require('../middleware/auth');
const { authorize, authorizeOwnerOrRoles } = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');

const router = express.Router();

const canViewStudentData = authorizeOwnerOrRoles('teacher', 'admin');

// Get claims for student
router.get('/student/:studentId', auth, canViewStudentData('studentId'), asyncHandler(async (req, res) => {
  const claims = await Claim.findByStudentId(req.params.studentId);
  res.json({ claims });
}));

// Get all claims for teachers/admins
router.get('/', auth, authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const claims = await Claim.findAll();
  res.json({ claims });
}));

// Submit new claim (student only)
router.post('/', [
  auth,
  authorize('student'),
  body('markId').isInt().withMessage('Invalid mark ID'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validate
], asyncHandler(async (req, res) => {
  const { markId, title, description } = req.body;

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
}));

// Review claim (teacher/admin only)
router.put('/:claimId/review', [
  auth,
  authorize('teacher', 'admin'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('reviewComments').trim().notEmpty().withMessage('Review comments are required'),
  validate
], asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { status, reviewComments } = req.body;

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return res.status(404).json({ message: 'Claim not found' });
  }

  const updatedClaim = await Claim.updateReview(claimId, status, req.user.userId, reviewComments);

  res.json({ message: `Claim ${status} successfully`, claim: updatedClaim });
}));

module.exports = router;
