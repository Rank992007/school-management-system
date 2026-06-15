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
  app.use('/api/students', require('../../routes/students'));
});

describe('Students Routes', () => {
  describe('GET /api/students', () => {
    it('should return all students for teacher', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findAll.mockResolvedValue([
        { id: 1, username: 'student1', role: 'student' }
      ]);

      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.students).toHaveLength(1);
      expect(User.findAll).toHaveBeenCalledWith('student');
    });

    it('should return all students for admin', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      User.findAll.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for student role', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/students/:studentId', () => {
    it('should return a specific student for teacher', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student', username: 'student1' });

      const res = await request(app)
        .get('/api/students/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.student.id).toBe(1);
    });

    it('should allow student to view their own profile', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });

      const res = await request(app)
        .get('/api/students/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for student viewing another student', async () => {
      const token = makeToken({ userId: 2, role: 'student' });

      const res = await request(app)
        .get('/api/students/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 if student not found', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/students/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user is not a student', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 5, role: 'teacher' });

      const res = await request(app)
        .get('/api/students/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
