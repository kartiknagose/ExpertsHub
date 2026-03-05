const { body, query } = require('express-validator');

const registerSchema = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('mobile').isMobilePhone().withMessage('Valid mobile number required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('role').optional().isIn(['CUSTOMER', 'WORKER']).withMessage('Role must be CUSTOMER or WORKER'),
];

// Worker registration schema — forces role to WORKER so the client doesn't need to send it
const registerWorkerSchema = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('mobile').isMobilePhone().withMessage('Valid mobile number required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  // Inject role=WORKER into req.body so the unified register handler picks it up
  (req, _res, next) => { req.body.role = 'WORKER'; next(); },
];

const loginSchema = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const verifyEmailSchema = [
  query('token').notEmpty().withMessage('Verification token required'),
];

const forgotPasswordSchema = [
  body('email').isEmail().withMessage('Valid email required'),
];

const resetPasswordSchema = [
  body('token').notEmpty().withMessage('Reset token required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
];

module.exports = {
  registerSchema,
  registerWorkerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};