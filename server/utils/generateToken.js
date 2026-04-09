const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, jwtSecret, { expiresIn: '30d' });
};

module.exports = generateToken;