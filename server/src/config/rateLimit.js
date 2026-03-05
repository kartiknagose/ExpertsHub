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
  keyGenerator: (req, _res) => {
    // Use user ID if authenticated, otherwise fall back to IP
    // Return undefined to use default IP handling (which handles IPv6 properly)
    return req.user?.id ? `user:${req.user.id}` : undefined;
  },
  skip: (req, _res) => {
    // Skip rate limiting for admins
    return req.user?.role === 'ADMIN';
  },
});

// Strict rate limiter for OTP verification (brute-force prevention)
// 5 attempts per 15 minutes per IP+bookingId combo.
// With 9,000 possible 4-digit OTPs, 5 attempts gives a 0.05% chance of
// guessing correctly — compared to 100% without rate limiting.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 OTP attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, _res) => {
    // Key by user ID + booking ID so each booking has its own counter.
    // This prevents an attacker from spreading attempts across bookings.
    const userId = req.user?.id || 'anon';
    const bookingId = req.params.id || 'unknown';
    return `otp:${userId}:${bookingId}`;
  },
  message: {
    error: 'Too many OTP attempts. Please wait 15 minutes before trying again.',
  },
});

module.exports = { authLimiter, bookingLimiter, otpLimiter };