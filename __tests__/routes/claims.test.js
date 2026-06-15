const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../helpers/setupApp');

jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../models/Claim');
jest.mock('../../models/Mark');

const Claim = require('../../models/Claim');
const Mark = require('../../models/Mark');

let app;
const SECRET = 'test-secret';

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = SECRET;
  app = createApp();
  app.use('/api/claims', require('../../routes/claims'));
});

describe('Claims Routes', () => {
  describe('GET /api/claims/student/:studentId', () => {
    it('should return claims for own student id', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Claim.findByStudentId.mockResolvedValue([{ id: 1, title: 'Dispute' }]);

      const res = await request(app)
        .get('/api/claims/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.claims).toHaveLength(1);
    });

    it('should allow teacher to view student claims', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Claim.findByStudentId.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/claims/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for student viewing other students claims', async () => {
      const token = makeToken({ userId: 2, role: 'student' });

      const res = await request(app)
        .get('/api/claims/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/claims', () => {
    it('should return all claims for teacher', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Claim.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const res = await request(app)
        .get('/api/claims')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.claims).toHaveLength(2);
    });

    it('should return all claims for admin', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      Claim.findAll.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/claims')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for student', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .get('/api/claims')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/claims', () => {
    const validClaim = {
      markId: 10,
      title: 'Score dispute',
      description: 'My score seems incorrect'
    };

    it('should allow student to submit a claim for their own mark', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Mark.findById.mockResolvedValue({ id: 10, student_id: 1 });
      Claim.create.mockResolvedValue({ id: 1, ...validClaim });

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send(validClaim);

      expect(res.status).toBe(201);
      expect(res.body.claim).toBeDefined();
    });

    it('should return 403 for teacher trying to submit a claim', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send(validClaim);

      expect(res.status).toBe(403);
    });

    it('should return 404 if mark does not belong to student', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Mark.findById.mockResolvedValue({ id: 10, student_id: 2 });

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send(validClaim);

      expect(res.status).toBe(404);
    });

    it('should return 404 if mark does not exist', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Mark.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send(validClaim);

      expect(res.status).toBe(404);
    });

    it('should return 400 for missing title', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send({ markId: 10, description: 'Missing title' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing description', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send({ markId: 10, title: 'Missing desc' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/claims/:claimId/review', () => {
    const validReview = {
      status: 'approved',
      reviewComments: 'Verified and corrected'
    };

    it('should allow teacher to review a claim', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Claim.findById.mockResolvedValue({ id: 1 });
      Claim.updateReview.mockResolvedValue({ id: 1, status: 'approved' });

      const res = await request(app)
        .put('/api/claims/1/review')
        .set('Authorization', `Bearer ${token}`)
        .send(validReview);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('approved');
    });

    it('should allow admin to review a claim', async () => {
      const token = makeToken({ userId: 3, role: 'admin' });
      Claim.findById.mockResolvedValue({ id: 1 });
      Claim.updateReview.mockResolvedValue({ id: 1, status: 'rejected' });

      const res = await request(app)
        .put('/api/claims/1/review')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'rejected', reviewComments: 'No evidence' });

      expect(res.status).toBe(200);
    });

    it('should return 403 for student trying to review', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .put('/api/claims/1/review')
        .set('Authorization', `Bearer ${token}`)
        .send(validReview);

      expect(res.status).toBe(403);
    });

    it('should return 404 if claim not found', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Claim.findById.mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/claims/999/review')
        .set('Authorization', `Bearer ${token}`)
        .send(validReview);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .put('/api/claims/1/review')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'maybe', reviewComments: 'hmm' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing review comments', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .put('/api/claims/1/review')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(400);
    });
  });
});
