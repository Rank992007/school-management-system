jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

const db = require('../../config/database');
const Claim = require('../../models/Claim');

describe('Claim Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert a new claim and return it', async () => {
      const claimData = {
        studentId: 1,
        markId: 10,
        title: 'Score dispute',
        description: 'I believe my score was miscalculated'
      };

      const mockRow = { id: 1, ...claimData, status: 'pending' };
      db.query.mockResolvedValue({ rows: [mockRow] });

      const result = await Claim.create(claimData);

      const [query, values] = db.query.mock.calls[0];
      expect(query).toContain('INSERT INTO claims');
      expect(values).toEqual([1, 10, 'Score dispute', 'I believe my score was miscalculated']);
      expect(result).toEqual(mockRow);
    });

    it('should throw on database error', async () => {
      db.query.mockRejectedValue(new Error('Insert failed'));

      await expect(Claim.create({
        studentId: 1, markId: 1, title: 'x', description: 'y'
      })).rejects.toThrow('Insert failed');
    });
  });

  describe('findByStudentId', () => {
    it('should return claims for a student with mark and reviewer info', async () => {
      const mockClaims = [
        { id: 1, student_id: 1, subject: 'Math', status: 'pending' }
      ];
      db.query.mockResolvedValue({ rows: mockClaims });

      const result = await Claim.findByStudentId(1);

      const query = db.query.mock.calls[0][0];
      expect(query).toContain('JOIN marks m ON c.mark_id = m.id');
      expect(query).toContain('LEFT JOIN users u ON c.reviewed_by = u.id');
      expect(result).toEqual(mockClaims);
    });

    it('should return empty array when no claims exist', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Claim.findByStudentId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all claims with student, mark, and reviewer info', async () => {
      const mockClaims = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockClaims });

      const result = await Claim.findAll();

      const query = db.query.mock.calls[0][0];
      expect(query).toContain('JOIN users s ON c.student_id = s.id');
      expect(query).toContain('JOIN marks m ON c.mark_id = m.id');
      expect(result).toEqual(mockClaims);
    });
  });

  describe('findById', () => {
    it('should return a claim by id', async () => {
      const mockClaim = { id: 5, title: 'Test claim', status: 'pending' };
      db.query.mockResolvedValue({ rows: [mockClaim] });

      const result = await Claim.findById(5);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [5]);
      expect(result).toEqual(mockClaim);
    });

    it('should return undefined when claim not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Claim.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('updateReview', () => {
    it('should update the review status and reviewer info', async () => {
      const mockUpdated = { id: 1, status: 'approved', reviewed_by: 2 };
      db.query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await Claim.updateReview(1, 'approved', 2, 'Looks correct');

      const [query, values] = db.query.mock.calls[0];
      expect(query).toContain('UPDATE claims');
      expect(query).toContain('status = $1');
      expect(query).toContain('reviewed_by = $2');
      expect(query).toContain('review_comments = $3');
      expect(values).toEqual(['approved', 2, 'Looks correct', 1]);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw on database error', async () => {
      db.query.mockRejectedValue(new Error('Update failed'));

      await expect(Claim.updateReview(1, 'rejected', 2, 'No')).rejects.toThrow('Update failed');
    });
  });
});
