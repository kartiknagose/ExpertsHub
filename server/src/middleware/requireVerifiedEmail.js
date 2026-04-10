const AppError = require('../common/errors/AppError');

module.exports = function requireVerifiedEmail(req, _res, next) {
  if (!req.user) {
    throw new AppError(401, 'Authentication required. Please log in to access this resource.');
  }

  if (!req.user.emailVerified) {
    throw new AppError(403, 'Please verify your email before continuing. Check your inbox or resend the verification email.');
  }

  next();
};