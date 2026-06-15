const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../helpers/setupApp');

jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../models/Bulletin');
jest.mock('../../models/Mark');
jest.mock('../../models/User');

const Bulletin = require('../../models/Bulletin');
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
  app.use('/api/bulletins', require('../../routes/bulletins'));
});

describe('Bulletins Routes', () => {
  describe('GET /api/bulletins/student/:studentId', () => {
    it('should return bulletins for own student id', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Bulletin.findByStudentId.mockResolvedValue([{ id: 1, semester: 'S1' }]);

      const res = await request(app)
        .get('/api/bulletins/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.bulletins).toHaveLength(1);
    });

    it('should allow teacher to view student bulletins', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Bulletin.findByStudentId.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/bulletins/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 if student views another students bulletins', async () => {
      const token = makeToken({ userId: 2, role: 'student' });

      const res = await request(app)
        .get('/api/bulletins/student/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/bulletins', () => {
    const validBody = {
      studentId: 1,
      semester: 'S1',
      academicYear: '2024-2025'
    };

    it('should generate a bulletin with grade calculation (A grade)', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 95, max_score: 100, test_type: 'exam', teacher_first_name: 'Jane', teacher_last_name: 'Smith', date: '2024-06-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1, grade: 'A', overall_average: 95 });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(Bulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({
          grade: 'A',
          overallAverage: 95
        })
      );
    });

    it('should calculate B grade for 80-89 average', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 85, max_score: 100, test_type: 'exam', teacher_first_name: 'Jane', teacher_last_name: 'Smith', date: '2024-06-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1, grade: 'B' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(Bulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'B' })
      );
    });

    it('should calculate C grade for 70-79 average', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 75, max_score: 100, test_type: 'exam', teacher_first_name: 'Jane', teacher_last_name: 'Smith', date: '2024-06-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1, grade: 'C' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(Bulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'C' })
      );
    });

    it('should calculate D grade for 60-69 average', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 65, max_score: 100, test_type: 'exam', teacher_first_name: 'Jane', teacher_last_name: 'Smith', date: '2024-06-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1, grade: 'D' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(Bulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'D' })
      );
    });

    it('should calculate F grade for below 60 average', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 40, max_score: 100, test_type: 'exam', teacher_first_name: 'Jane', teacher_last_name: 'Smith', date: '2024-06-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1, grade: 'F' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(Bulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'F' })
      );
    });

    it('should handle no marks for the semester (F, 0 average)', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([]);
      Bulletin.create.mockResolvedValue({ id: 1, grade: 'F' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(Bulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({ overallAverage: 0, grade: 'F' })
      );
    });

    it('should group marks by subject and calculate per-subject averages', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 80, max_score: 100, test_type: 'exam', teacher_first_name: 'J', teacher_last_name: 'S', date: '2024-01-01' },
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 90, max_score: 100, test_type: 'quiz', teacher_first_name: 'J', teacher_last_name: 'S', date: '2024-02-01' },
        { subject: 'Science', semester: 'S1', academic_year: '2024-2025', score: 70, max_score: 100, test_type: 'exam', teacher_first_name: 'B', teacher_last_name: 'T', date: '2024-01-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1 });

      await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      const createCall = Bulletin.create.mock.calls[0][0];
      expect(createCall.subjects).toHaveLength(2);
      const mathSubject = createCall.subjects.find(s => s.subjectName === 'Math');
      expect(mathSubject.averageScore).toBe(85); // (80+90)/(100+100)*100
      expect(mathSubject.marks).toHaveLength(2);
    });

    it('should filter marks by semester and academic year', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'student' });
      Mark.findByStudentId.mockResolvedValue([
        { subject: 'Math', semester: 'S1', academic_year: '2024-2025', score: 90, max_score: 100, test_type: 'exam', teacher_first_name: 'J', teacher_last_name: 'S', date: '2024-01-01' },
        { subject: 'Math', semester: 'S2', academic_year: '2024-2025', score: 50, max_score: 100, test_type: 'exam', teacher_first_name: 'J', teacher_last_name: 'S', date: '2024-06-01' }
      ]);
      Bulletin.create.mockResolvedValue({ id: 1 });

      await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      const createCall = Bulletin.create.mock.calls[0][0];
      // Only S1 marks should be included
      expect(createCall.subjects).toHaveLength(1);
      expect(createCall.overallAverage).toBe(90);
    });

    it('should return 403 for student role', async () => {
      const token = makeToken({ userId: 1, role: 'student' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(res.status).toBe(403);
    });

    it('should return 404 if student not found', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(res.status).toBe(404);
    });

    it('should return 404 if user is not a student', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      User.findById.mockResolvedValue({ id: 1, role: 'teacher' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(res.status).toBe(404);
    });

    it('should return 400 for missing semester', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });

      const res = await request(app)
        .post('/api/bulletins')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentId: 1, academicYear: '2024-2025' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bulletins/:bulletinId', () => {
    it('should return a specific bulletin for authorized user', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Bulletin.findById.mockResolvedValue({ id: 5, student_id: 1, semester: 'S1' });

      const res = await request(app)
        .get('/api/bulletins/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.bulletin.id).toBe(5);
    });

    it('should allow teacher to view any bulletin', async () => {
      const token = makeToken({ userId: 2, role: 'teacher' });
      Bulletin.findById.mockResolvedValue({ id: 5, student_id: 1 });

      const res = await request(app)
        .get('/api/bulletins/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for student viewing others bulletin', async () => {
      const token = makeToken({ userId: 2, role: 'student' });
      Bulletin.findById.mockResolvedValue({ id: 5, student_id: 1 });

      const res = await request(app)
        .get('/api/bulletins/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 if bulletin not found', async () => {
      const token = makeToken({ userId: 1, role: 'student' });
      Bulletin.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/bulletins/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
