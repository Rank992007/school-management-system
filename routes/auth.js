const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const { generateToken, formatUserResponse } = require('../utils/tokenUtils');
const { sendNewVerificationCode } = require('../utils/verificationUtils');

const router = express.Router();

// Register user
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  validate
], asyncHandler(async (req, res) => {
  const { username, email, password, role, firstName, lastName, dateOfBirth, grade, subject } = req.body;

  const existingUserByUsername = await User.findByUsername(username);
  const existingUserByEmail = await User.findByEmail(email);
  
  if (existingUserByUsername || existingUserByEmail) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    username, email, password, role, firstName, lastName, dateOfBirth, grade, subject
  });

  await sendNewVerificationCode(user.id, email);

  res.status(201).json({
    message: 'Registration successful. Please check your email for verification code.',
    userId: user.id,
    email: user.email
  });
}));

// Login user
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findByUsername(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await User.comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user);

  res.json({
    message: 'Login successful',
    token,
    user: formatUserResponse(user)
  });
}));

// Get current user
router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user });
}));

// Verify email with code
router.post('/verify', [
  body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Invalid verification code'),
  validate
], asyncHandler(async (req, res) => {
  const { code } = req.body;

  const user = await User.verifyEmail(code);
  
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification code' });
  }

  const token = generateToken(user);

  res.json({
    message: 'Email verified successfully',
    token,
    user: formatUserResponse(user)
  });
}));

// Resend verification code
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  validate
], asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.is_verified) {
    return res.status(400).json({ message: 'Email already verified' });
  }

  await sendNewVerificationCode(user.id, email);

  res.json({
    message: 'Verification code sent successfully. Please check your email.'
  });
}));

module.exports = router;
