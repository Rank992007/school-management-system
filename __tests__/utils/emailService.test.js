jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  })
}));

const nodemailer = require('nodemailer');
const { generateVerificationCode, sendVerificationCode } = require('../../utils/emailService');

describe('Email Service', () => {
  describe('generateVerificationCode', () => {
    it('should return a 6-digit string', () => {
      const code = generateVerificationCode();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('should return a number >= 100000', () => {
      const code = generateVerificationCode();
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
    });

    it('should return a number <= 999999', () => {
      const code = generateVerificationCode();
      expect(parseInt(code)).toBeLessThanOrEqual(999999);
    });

    it('should generate different codes on successive calls (probabilistic)', () => {
      const codes = new Set();
      for (let i = 0; i < 50; i++) {
        codes.add(generateVerificationCode());
      }
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe('sendVerificationCode', () => {
    let mockSendMail;

    beforeEach(() => {
      mockSendMail = nodemailer.createTransport().sendMail;
      mockSendMail.mockReset();
      process.env.EMAIL_USER = 'test@example.com';
    });

    it('should return true when email is sent successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: '123' });

      const result = await sendVerificationCode('user@example.com', '123456');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Verification Code')
        })
      );
    });

    it('should return false when email sending fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await sendVerificationCode('user@example.com', '123456');

      expect(result).toBe(false);
    });

    it('should include the verification code in the HTML body', async () => {
      mockSendMail.mockResolvedValue({ messageId: '123' });

      await sendVerificationCode('user@example.com', '654321');

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('654321');
    });
  });
});
