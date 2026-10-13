const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendContactMessage } = require('../utils/emailService');

const router = express.Router();

router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('subject').trim().isLength({ min: 1, max: 150 }).withMessage('Subject must be between 1 and 150 characters'),
  body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await sendContactMessage(req.body);
    return res.json({ message: 'Your message was sent successfully.' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    return res.status(500).json({ message: 'We could not send your message right now. Please try again later.' });
  }
});

module.exports = router;
