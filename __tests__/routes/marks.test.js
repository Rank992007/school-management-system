const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../helpers/setupApp');

jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../models/Mark');
jest.mock('../../models/User');

const Mark = require('../../models/Mark');
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
  app.use('/api/marks', require('../../routes/marks'));
});

describe('Marks Routes', () => {
  describe('GET /api/marks/student/:studentId', () => {
    it('should return marks for the student (own marks)', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([{ id: 1, subject: 'Math' }]);

      const res = await request(app)
        .get('/api/marks/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.marks).toHaveLength(1);
    });

    it('should allow teacher to view any student marks', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Mark.findByStudentId.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/marks/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 if student tries to view another students marks', async () => {
      const token = makeToken({ userId: 2, role: 'student' });

      const res = await request(app)
        .get('/api/marks/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/marks/student/1');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/marks', () => {
    const validMark = {
      studentId: 1,
      subject: 'Math',
      testType: 'exam',
      score: 85,
      semester: 'S1',
      academicYear: '2024-2025'
    };

    it('should allow teacher to add a mark', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.create.mockResolvedValue({ id: 1, ...validMark });

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send(validMark);

      expect(res.status).toBe(201);
      expect(res.body.mark).toBeDefined();
    });

    it('should return 403 for student role', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send(validMark);

      expect(res.status).toBe(403);
    });

    it('should return 404 if student not found', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send(validMark);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user is not a student', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'teacher' });

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send(validMark);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid test type', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validMark, testType: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for score out of range', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validMark, score: 150 });

      expect(res.status).toBe(400);
    });

    it('should allow admin to add marks', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/marks')
        .set('Authorization', `Bearer ${token}`)
        .send(validMark);

      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/marks/:markId', () => {
    it('should allow the owning teacher to update a mark', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Mark.findById.mockResolvedValue({ id: 1, teacher_id: 2 });
      Mark.update.mockResolvedValue({ id: 1, score: 90 });

      const res = await request(app)
        .put('/api/marks/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ score: 90, comments: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.mark.score).toBe(90);
    });

    it('should return 403 if teacher does not own the mark', async () => {
      const token = makeToken({ userId: 3, role: 'teacher' });
      Mark.findById.mockResolvedValue({ id: 1, teacher_id: 2 });

      const res = await request(app)
        .put('/api/marks/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ score: 90 });

      expect(res.status).toBe(403);
    });

    it('should allow admin to update any mark', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      Mark.findById.mockResolvedValue({ id: 1, teacher_id: 2 });
      Mark.update.mockResolvedValue({ id: 1, score: 90 });

      const res = await request(app)
        .put('/api/marks/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ score: 90 });

      expect(res.status).toBe(200);
    });

    it('should return 404 if mark not found', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Mark.findById.mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/marks/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ score: 90 });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid score', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .put('/api/marks/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ score: -5 });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/marks/:markId', () => {
    it('should allow the owning teacher to delete a mark', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Mark.findById.mockResolvedValue({ id: 1, teacher_id: 2 });
      Mark.delete.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete('/api/marks/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });

    it('should return 403 for student role', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .delete('/api/marks/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 403 if teacher does not own the mark', async () => {
      const token = makeToken({ userId: 3, role: 'teacher' });
      Mark.findById.mockResolvedValue({ id: 1, teacher_id: 2 });

      const res = await request(app)
        .delete('/api/marks/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 if mark not found', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Mark.findById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/marks/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
