const { Router } = require('express');
const { register, registerWorker, login, logout, me, verifyEmail, forgotPassword, resetPassword } = require('./auth.controller');
const { registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } = require('./auth.schemas');
const validate = require('../../middleware/validation');
const auth = require('../../middleware/auth');
const { authLimiter } = require('../../config/rateLimit');

const router = Router();

router.post('/register', authLimiter, registerSchema, validate, register);
router.post('/register-customer', authLimiter, registerSchema, validate, register);
router.post('/register-worker', authLimiter, registerSchema, validate, registerWorker);
router.post('/login', authLimiter, loginSchema, validate, login);
router.post('/logout', auth, logout);
router.get('/me', auth, me);
router.get('/verify-email', verifyEmailSchema, validate, verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordSchema, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordSchema, validate, resetPassword);

module.exports = router;