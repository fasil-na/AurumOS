const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT for authentication
const generateAuthToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

// Generate random secure token for invitations or password resets
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAuthToken,
  generateRandomToken
};
