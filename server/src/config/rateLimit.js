const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for booking creation (stricter)
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each user to 20 bookings per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use user ID if authenticated, otherwise fall back to IP
    // Return undefined to use default IP handling (which handles IPv6 properly)
    return req.user?.id ? `user:${req.user.id}` : undefined;
  },
  skip: (req, res) => {
    // Skip rate limiting for admins
    return req.user?.role === 'ADMIN';
  },
});

module.exports = { authLimiter, bookingLimiter };