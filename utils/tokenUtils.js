const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const formatUserResponse = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  firstName: user.first_name,
  lastName: user.last_name
});

module.exports = { generateToken, formatUserResponse };
