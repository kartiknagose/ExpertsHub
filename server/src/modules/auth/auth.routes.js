const { Router } = require('express');
const { register, login, logout, me } = require('./auth.controller');
const { registerSchema, loginSchema } = require('./auth.schemas');
const validate = require('../../middleware/validation');
const auth = require('../../middleware/auth');
const { authLimiter } = require('../../config/rateLimit');

const router = Router();

router.post('/register', authLimiter, registerSchema, validate, register);
router.post('/login', authLimiter, loginSchema, validate, login);
router.post('/logout', auth, logout);
router.get('/me', auth, me);

module.exports = router;