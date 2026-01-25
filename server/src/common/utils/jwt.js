const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');

function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d', ...options });
}

function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signJwt, verifyJwt };