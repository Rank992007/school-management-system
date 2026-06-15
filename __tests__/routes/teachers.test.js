const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../helpers/setupApp');

jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../models/User');

const User = require('../../models/User');

let app;
const SECRET = 'test-secret';

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = SECRET;
  app = createApp();
  app.use('/api/teachers', require('../../routes/teachers'));
});

describe('Teachers Routes', () => {
  describe('GET /api/teachers', () => {
    it('should return all teachers for admin', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      User.findAll.mockResolvedValue([
        { id: 2, username: 'teacher1', role: 'teacher' }
      ]);

      const res = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.teachers).toHaveLength(1);
      expect(User.findAll).toHaveBeenCalledWith('teacher');
    });

    it('should return 403 for teacher role', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 403 for student role', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/teachers');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/teachers/:teacherId', () => {
    it('should return a specific teacher for admin', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      User.findById.mockResolvedValue({ id: 2, role: 'teacher', username: 'teacher1' });

      const res = await request(app)
        .get('/api/teachers/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.teacher.id).toBe(2);
    });

    it('should allow teacher to view their own profile', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 2, role: 'teacher' });

      const res = await request(app)
        .get('/api/teachers/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for teacher viewing another teacher', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .get('/api/teachers/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 403 for student', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .get('/api/teachers/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 if teacher not found', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/teachers/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user is not a teacher', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });

      const res = await request(app)
        .get('/api/teachers/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
