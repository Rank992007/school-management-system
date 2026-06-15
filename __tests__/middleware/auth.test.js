const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    req.header.mockReturnValue(undefined);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is empty string', () => {
    req.header.mockReturnValue('');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.header.mockReturnValue('Bearer invalid-token');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set req.user for a valid token', () => {
    const payload = { userId: 1, role: 'student' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.header.mockReturnValue(`Bearer ${token}`);

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.role).toBe('student');
  });

  it('should return 401 for an expired token', () => {
    const payload = { userId: 1, role: 'student' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1s' });
    req.header.mockReturnValue(`Bearer ${token}`);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is signed with wrong secret', () => {
    const payload = { userId: 1, role: 'student' };
    const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
    req.header.mockReturnValue(`Bearer ${token}`);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle token without Bearer prefix', () => {
    const payload = { userId: 1, role: 'student' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.header.mockReturnValue(token);

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe(1);
  });
});
