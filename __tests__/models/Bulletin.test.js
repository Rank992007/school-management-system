jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

const db = require('../../config/database');
const Bulletin = require('../../models/Bulletin');

describe('Bulletin Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a bulletin with subjects and marks in a transaction', async () => {
      const bulletinData = {
        studentId: 1,
        semester: 'S1',
        academicYear: '2024-2025',
        subjects: [
          {
            subjectName: 'Math',
            teacherName: 'Jane Smith',
            averageScore: 85,
            marks: [
              { testType: 'exam', score: 85, maxScore: 100, date: '2024-06-01' }
            ]
          }
        ],
        overallAverage: 85,
        grade: 'B',
        attendance: { totalDays: 180, presentDays: 170, percentage: 94.4 },
        generatedBy: 2
      };

      const mockBulletin = { id: 10, student_id: 1 };
      const mockSubject = { id: 20 };
      const mockFullBulletin = {
        id: 10,
        student_id: 1,
        subjects: [{ id: 20, subject_name: 'Math', marks: [] }]
      };

      // BEGIN
      db.query.mockResolvedValueOnce({});
      // INSERT bulletin
      db.query.mockResolvedValueOnce({ rows: [mockBulletin] });
      // INSERT bulletin_subject
      db.query.mockResolvedValueOnce({ rows: [mockSubject] });
      // INSERT bulletin_mark
      db.query.mockResolvedValueOnce({});
      // COMMIT
      db.query.mockResolvedValueOnce({});
      // findById query (bulletin)
      db.query.mockResolvedValueOnce({ rows: [mockFullBulletin] });
      // getBulletinSubjects query
      db.query.mockResolvedValueOnce({ rows: [{ id: 20, subject_name: 'Math' }] });
      // getBulletinMarks query
      db.query.mockResolvedValueOnce({ rows: [{ test_type: 'exam', score: 85 }] });

      const result = await Bulletin.create(bulletinData);

      // Should start with BEGIN
      expect(db.query.mock.calls[0][0]).toBe('BEGIN');
      // Should insert bulletin
      expect(db.query.mock.calls[1][0]).toContain('INSERT INTO bulletins');
      // Should insert subject
      expect(db.query.mock.calls[2][0]).toContain('INSERT INTO bulletin_subjects');
      // Should insert mark
      expect(db.query.mock.calls[3][0]).toContain('INSERT INTO bulletin_marks');
      // Should commit
      expect(db.query.mock.calls[4][0]).toBe('COMMIT');
    });

    it('should rollback on error', async () => {
      db.query.mockResolvedValueOnce({});  // BEGIN
      db.query.mockRejectedValueOnce(new Error('Insert failed'));  // bulletin insert fails
      db.query.mockResolvedValueOnce({});  // ROLLBACK

      await expect(Bulletin.create({
        studentId: 1,
        semester: 'S1',
        academicYear: '2024',
        subjects: [],
        overallAverage: 0,
        grade: 'F',
        attendance: {},
        generatedBy: 1
      })).rejects.toThrow('Insert failed');

      // Last call should be ROLLBACK
      const lastCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      expect(lastCall[0]).toBe('ROLLBACK');
    });

    it('should use defaults for missing optional fields', async () => {
      const bulletinData = {
        studentId: 1,
        semester: 'S1',
        academicYear: '2024',
        subjects: [{ subjectName: 'Art', teacherName: 'Bob', marks: [] }],
        generatedBy: 2
      };

      db.query.mockResolvedValueOnce({});  // BEGIN
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });  // bulletin insert
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });  // subject insert
      db.query.mockResolvedValueOnce({});  // COMMIT
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, subjects: [] }] });  // findById
      db.query.mockResolvedValueOnce({ rows: [] });  // subjects

      await Bulletin.create(bulletinData);

      const bulletinValues = db.query.mock.calls[1][1];
      // overallAverage defaults to 0, grade to 'F', attendance fields to 0
      expect(bulletinValues[3]).toBe(0);  // overallAverage
      expect(bulletinValues[4]).toBe('F');  // grade
      expect(bulletinValues[5]).toBe(0);  // totalDays
      expect(bulletinValues[6]).toBe(0);  // presentDays
      expect(bulletinValues[7]).toBe(0);  // percentage
    });
  });

  describe('findByStudentId', () => {
    it('should return bulletins with subjects and marks', async () => {
      const mockBulletins = [{ id: 1, student_id: 1 }];
      const mockSubjects = [{ id: 10, subject_name: 'Math' }];
      const mockMarks = [{ id: 100, test_type: 'exam', score: 90 }];

      // findByStudentId query
      db.query.mockResolvedValueOnce({ rows: mockBulletins });
      // getBulletinSubjects
      db.query.mockResolvedValueOnce({ rows: mockSubjects });
      // getBulletinMarks
      db.query.mockResolvedValueOnce({ rows: mockMarks });

      const result = await Bulletin.findByStudentId(1);

      expect(result).toHaveLength(1);
      expect(result[0].subjects).toEqual([{ id: 10, subject_name: 'Math', marks: mockMarks }]);
    });

    it('should return empty array when no bulletins found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Bulletin.findByStudentId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a bulletin with subjects and marks', async () => {
      const mockBulletin = { id: 1, student_id: 1 };
      const mockSubjects = [{ id: 10, subject_name: 'Science' }];
      const mockMarks = [{ score: 80 }];

      db.query.mockResolvedValueOnce({ rows: [mockBulletin] });
      db.query.mockResolvedValueOnce({ rows: mockSubjects });
      db.query.mockResolvedValueOnce({ rows: mockMarks });

      const result = await Bulletin.findById(1);

      expect(result.subjects).toBeDefined();
      expect(result.subjects[0].marks).toEqual(mockMarks);
    });

    it('should return null when bulletin not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Bulletin.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('getBulletinSubjects', () => {
    it('should return subjects with their marks', async () => {
      const mockSubjects = [{ id: 10 }, { id: 11 }];
      const mockMarks1 = [{ score: 90 }];
      const mockMarks2 = [{ score: 80 }];

      db.query.mockResolvedValueOnce({ rows: mockSubjects });
      db.query.mockResolvedValueOnce({ rows: mockMarks1 });
      db.query.mockResolvedValueOnce({ rows: mockMarks2 });

      const result = await Bulletin.getBulletinSubjects(1);

      expect(result).toHaveLength(2);
      expect(result[0].marks).toEqual(mockMarks1);
      expect(result[1].marks).toEqual(mockMarks2);
    });

    it('should return empty array when no subjects', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Bulletin.getBulletinSubjects(999);

      expect(result).toEqual([]);
    });
  });
});
