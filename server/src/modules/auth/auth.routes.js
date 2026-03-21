const { Router } = require('express');
const { register, login, logout, me, verifyEmail, forgotPassword, resetPassword, changePassword, syncUser } = require('./auth.controller');
const { registerSchema, registerWorkerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, syncUserSchema } = require('./auth.schemas');
const validate = require('../../middleware/validation');
const auth = require('../../middleware/auth');
const { requireClerkSession } = require('../../middleware/auth');
const { authLimiter } = require('../../config/rateLimit');

const router = Router();

// ── Clerk-native routes ──────────────────────────────────────────────────────
// POST /api/auth/sync — create or link a DB user profile after Clerk sign-up.
// Uses requireClerkSession (verifies Clerk JWT only, no DB user required yet).
router.post('/sync', authLimiter, ...requireClerkSession, syncUserSchema, validate, syncUser);

// ── Legacy routes (kept for backward compatibility) ──────────────────────────
router.post('/register', authLimiter, registerSchema, validate, register);
router.post('/register-customer', authLimiter, registerSchema, validate, register);
router.post('/register-worker', authLimiter, registerWorkerSchema, validate, register);
router.post('/login', authLimiter, loginSchema, validate, login);
router.post('/logout', auth, logout);
router.get('/me', auth, me);
router.get('/verify-email', verifyEmailSchema, validate, verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordSchema, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordSchema, validate, resetPassword);
router.post('/change-password', auth, changePasswordSchema, validate, changePassword);

module.exports = router;