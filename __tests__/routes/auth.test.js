const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../helpers/setupApp');

jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../models/User');
jest.mock('../../utils/emailService');

const User = require('../../models/User');
const { generateVerificationCode, sendVerificationCode } = require('../../utils/emailService');

let app;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  app = createApp();
  app.use('/api/auth', require('../../routes/auth'));
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    const validBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should register a new user and send verification email', async () => {
      User.findByUsername.mockResolvedValue(null);
      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1, email: 'test@example.com' });
      generateVerificationCode.mockReturnValue('123456');
      User.updateVerificationCode.mockResolvedValue({});
      sendVerificationCode.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Registration successful');
      expect(res.body.userId).toBe(1);
      expect(User.create).toHaveBeenCalled();
      expect(sendVerificationCode).toHaveBeenCalledWith('test@example.com', '123456');
    });

    it('should return 400 if username already exists', async () => {
      User.findByUsername.mockResolvedValue({ id: 1 });
      User.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should return 400 if email already exists', async () => {
      User.findByUsername.mockResolvedValue(null);
      User.findByEmail.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/auth/register')
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should return 400 for validation errors (short username)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validBody, username: 'ab' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validBody, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validBody, password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validBody, role: 'principal' });

      expect(res.status).toBe(400);
    });

    it('should return 500 if verification email fails to send', async () => {
      User.findByUsername.mockResolvedValue(null);
      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1, email: 'test@example.com' });
      generateVerificationCode.mockReturnValue('123456');
      User.updateVerificationCode.mockResolvedValue({});
      sendVerificationCode.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validBody);

      expect(res.status).toBe(500);
      expect(res.body.message).toContain('Failed to send verification email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        role: 'student',
        first_name: 'John',
        last_name: 'Doe'
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.id).toBe(1);
      expect(res.body.user.username).toBe('testuser');
    });

    it('should return 401 for invalid username', async () => {
      User.findByUsername.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nouser', password: 'pass' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      User.findByUsername.mockResolvedValue({ id: 1, password: 'hashed' });
      User.comparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for missing username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info with valid token', async () => {
      const mockUser = { id: 1, username: 'testuser', role: 'student' };
      User.findById.mockResolvedValue(mockUser);

      const token = jwt.sign({ userId: 1, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 404 if user not found in database', async () => {
      User.findById.mockResolvedValue(null);

      const token = jwt.sign({ userId: 999, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/auth/verify', () => {
    it('should verify email with valid code', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', role: 'student', first_name: 'John', last_name: 'Doe' };
      User.verifyEmail.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/verify')
        .send({ code: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('verified successfully');
      expect(res.body.token).toBeDefined();
    });

    it('should return 400 for invalid code', async () => {
      User.verifyEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/verify')
        .send({ code: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid or expired');
    });

    it('should return 400 for too-short code', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({ code: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('should resend verification code to unverified user', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, is_verified: false });
      generateVerificationCode.mockReturnValue('654321');
      User.updateVerificationCode.mockResolvedValue({});
      sendVerificationCode.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Verification code sent');
    });

    it('should return 404 if user not found', async () => {
      User.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'none@example.com' });

      expect(res.status).toBe(404);
    });

    it('should return 400 if already verified', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, is_verified: true });

      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'verified@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already verified');
    });

    it('should return 500 if email fails to send', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, is_verified: false });
      generateVerificationCode.mockReturnValue('654321');
      User.updateVerificationCode.mockResolvedValue({});
      sendVerificationCode.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(500);
    });
  });
});
