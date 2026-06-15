const User = require('../models/User');
const { generateVerificationCode, sendVerificationCode } = require('./emailService');

const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const sendNewVerificationCode = async (userId, email) => {
  const verificationCode = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS);

  await User.updateVerificationCode(userId, verificationCode, expiresAt);

  const emailSent = await sendVerificationCode(email, verificationCode);
  if (!emailSent) {
    const error = new Error('Failed to send verification email');
    error.statusCode = 500;
    throw error;
  }
};

module.exports = { sendNewVerificationCode };
