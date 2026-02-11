const { body, query } = require('express-validator');

const registerSchema = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('mobile').isMobilePhone().withMessage('Valid mobile number required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
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
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};