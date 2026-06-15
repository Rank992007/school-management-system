jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

const db = require('../../config/database');
const Mark = require('../../models/Mark');

describe('Mark Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert a new mark and return it', async () => {
      const markData = {
        studentId: 1,
        teacherId: 2,
        subject: 'Math',
        testType: 'exam',
        score: 85,
        maxScore: 100,
        semester: 'S1',
        academicYear: '2024-2025',
        comments: 'Good work'
      };

      const mockRow = { id: 1, ...markData };
      db.query.mockResolvedValue({ rows: [mockRow] });

      const result = await Mark.create(markData);

      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, values] = db.query.mock.calls[0];
      expect(query).toContain('INSERT INTO marks');
      expect(values).toEqual([1, 2, 'Math', 'exam', 85, 100, 'S1', '2024-2025', 'Good work']);
      expect(result).toEqual(mockRow);
    });

    it('should default maxScore to 100 when not provided', async () => {
      const markData = {
        studentId: 1,
        teacherId: 2,
        subject: 'Science',
        testType: 'quiz',
        score: 70,
        maxScore: undefined,
        semester: 'S1',
        academicYear: '2024-2025',
        comments: null
      };

      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await Mark.create(markData);

      const values = db.query.mock.calls[0][1];
      expect(values[5]).toBe(100);
    });

    it('should throw on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Mark.create({
        studentId: 1, teacherId: 2, subject: 'x', testType: 'exam',
        score: 50, maxScore: 100, semester: 'S1', academicYear: '2024'
      })).rejects.toThrow('DB error');
    });
  });

  describe('findByStudentId', () => {
    it('should return marks for a given student with teacher info', async () => {
      const mockMarks = [
        { id: 1, student_id: 1, subject: 'Math', teacher_first_name: 'Jane', teacher_last_name: 'Smith' }
      ];
      db.query.mockResolvedValue({ rows: mockMarks });

      const result = await Mark.findByStudentId(1);

      expect(db.query).toHaveBeenCalledTimes(1);
      const query = db.query.mock.calls[0][0];
      expect(query).toContain('JOIN users u ON m.teacher_id = u.id');
      expect(result).toEqual(mockMarks);
    });

    it('should return empty array when student has no marks', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Mark.findByStudentId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all marks with student and teacher names', async () => {
      const mockMarks = [{ id: 1, subject: 'Math' }];
      db.query.mockResolvedValue({ rows: mockMarks });

      const result = await Mark.findAll();

      const query = db.query.mock.calls[0][0];
      expect(query).toContain('JOIN users s ON m.student_id = s.id');
      expect(query).toContain('JOIN users t ON m.teacher_id = t.id');
      expect(result).toEqual(mockMarks);
    });
  });

  describe('findById', () => {
    it('should return a mark by id', async () => {
      const mockMark = { id: 5, subject: 'Science', score: 90 };
      db.query.mockResolvedValue({ rows: [mockMark] });

      const result = await Mark.findById(5);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [5]);
      expect(result).toEqual(mockMark);
    });

    it('should return undefined when mark not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Mark.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update score and comments', async () => {
      const updatedMark = { id: 1, score: 95, comments: 'Updated' };
      db.query.mockResolvedValue({ rows: [updatedMark] });

      const result = await Mark.update(1, { score: 95, comments: 'Updated' });

      const [query, values] = db.query.mock.calls[0];
      expect(query).toContain('UPDATE marks');
      expect(values).toEqual([95, 'Updated', 1]);
      expect(result).toEqual(updatedMark);
    });

    it('should throw on database error', async () => {
      db.query.mockRejectedValue(new Error('Update failed'));

      await expect(Mark.update(1, { score: 50, comments: '' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete a mark and return it', async () => {
      const deletedMark = { id: 1, subject: 'Math' };
      db.query.mockResolvedValue({ rows: [deletedMark] });

      const result = await Mark.delete(1);

      expect(db.query).toHaveBeenCalledWith('DELETE FROM marks WHERE id = $1 RETURNING *', [1]);
      expect(result).toEqual(deletedMark);
    });

    it('should return undefined when deleting non-existent mark', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Mark.delete(999);

      expect(result).toBeUndefined();
    });
  });
});
