const bcrypt = require('bcryptjs');

jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

const db = require('../../config/database');
const User = require('../../models/User');

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash the password and insert a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2000-01-01',
        grade: '10',
        subject: null
      };

      const mockRow = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'student',
        first_name: 'John',
        last_name: 'Doe',
        created_at: new Date()
      };

      db.query.mockResolvedValue({ rows: [mockRow] });

      const result = await User.create(userData);

      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, values] = db.query.mock.calls[0];
      expect(query).toContain('INSERT INTO users');
      expect(values[0]).toBe('testuser');
      expect(values[1]).toBe('test@example.com');
      // Password should be hashed, not plaintext
      expect(values[2]).not.toBe('password123');
      expect(await bcrypt.compare('password123', values[2])).toBe(true);
      expect(result).toEqual(mockRow);
    });

    it('should throw an error if database query fails', async () => {
      db.query.mockRejectedValue(new Error('Duplicate key'));

      await expect(User.create({
        username: 'dup',
        email: 'dup@example.com',
        password: 'pass',
        role: 'student'
      })).rejects.toThrow('Duplicate key');
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByUsername('testuser');

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await User.findByUsername('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should throw on database error', async () => {
      db.query.mockRejectedValue(new Error('Connection error'));

      await expect(User.findByUsername('test')).rejects.toThrow('Connection error');
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail('test@example.com');

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com']);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when email not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('none@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return a user without password field', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', role: 'student' };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(db.query).toHaveBeenCalledTimes(1);
      const query = db.query.mock.calls[0][0];
      expect(query).not.toContain('password');
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await User.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all users when no role specified', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', role: 'student' },
        { id: 2, username: 'user2', role: 'teacher' }
      ];
      db.query.mockResolvedValue({ rows: mockUsers });

      const result = await User.findAll();

      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, params] = db.query.mock.calls[0];
      expect(query).not.toContain('WHERE');
      expect(params).toEqual([]);
      expect(result).toEqual(mockUsers);
    });

    it('should filter by role when specified', async () => {
      const mockStudents = [{ id: 1, username: 'student1', role: 'student' }];
      db.query.mockResolvedValue({ rows: mockStudents });

      const result = await User.findAll('student');

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain('WHERE role = $1');
      expect(params).toEqual(['student']);
      expect(result).toEqual(mockStudents);
    });

    it('should order results by created_at DESC', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await User.findAll();

      const query = db.query.mock.calls[0][0];
      expect(query).toContain('ORDER BY created_at DESC');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'test123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await User.comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const hashed = await bcrypt.hash('correct', 10);

      const result = await User.comparePassword('wrong', hashed);

      expect(result).toBe(false);
    });
  });

  describe('updateVerificationCode', () => {
    it('should update the verification code for a user', async () => {
      const mockResult = { id: 1, email: 'test@example.com' };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const expiresAt = new Date();
      const result = await User.updateVerificationCode(1, '123456', expiresAt);

      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, values] = db.query.mock.calls[0];
      expect(query).toContain('UPDATE users');
      expect(query).toContain('verification_code');
      expect(values).toEqual(['123456', expiresAt, 1]);
      expect(result).toEqual(mockResult);
    });
  });

  describe('verifyEmail', () => {
    it('should verify the email and return the user', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.verifyEmail('123456');

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('verification_code = $1'), ['123456']);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined for invalid/expired code', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await User.verifyEmail('000000');

      expect(result).toBeUndefined();
    });
  });

  describe('findByVerificationCode', () => {
    it('should return a user with valid, non-expired code', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByVerificationCode('123456');

      expect(result).toEqual(mockUser);
    });

    it('should return undefined if code not found or expired', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await User.findByVerificationCode('expired');

      expect(result).toBeUndefined();
    });
  });
});
