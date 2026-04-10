const { Router } = require('express');
const { register, login, logout, me, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword } = require('./auth.controller');
const { registerSchema, registerCustomerSchema, registerWorkerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } = require('./auth.schemas');
const validate = require('../../middleware/validation');
const auth = require('../../middleware/auth');
const {
	authLimiter,
	registerLimiter,
	loginLimiter,
	passwordResetLimiter,
} = require('../../config/rateLimit');

const router = Router();

router.post('/register', registerLimiter, registerSchema, validate, register);
router.post('/register-customer', registerLimiter, registerCustomerSchema, validate, register);
router.post('/register-worker', registerLimiter, registerWorkerSchema, validate, register);
router.post('/login', loginLimiter, loginSchema, validate, login);
router.post('/logout', auth, logout);
router.get('/me', auth, me);
router.get('/verify-email', authLimiter, verifyEmailSchema, validate, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerificationSchema, validate, resendVerification);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordSchema, validate, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordSchema, validate, resetPassword);
router.post('/change-password', auth, changePasswordSchema, validate, changePassword);

module.exports = router;