const asyncHandler = require('../../common/utils/asyncHandler');
const prisma = require('../../config/prisma');
const { registerUser, registerWorker, loginUser, verifyEmailToken, requestPasswordReset, resetPasswordWithToken } = require('./auth.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production', // Auto-enable in production
  maxAge: 24 * 60 * 60 * 1000,
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const { user, token, verificationToken } = await registerUser({ name, email, mobile, password });
  const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhotoUrl: user.profilePhotoUrl || null,
    },
    verificationLink,
  });
});

exports.registerWorker = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const { user, token, verificationToken } = await registerWorker({ name, email, mobile, password });
  const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhotoUrl: user.profilePhotoUrl || null,
    },
    verificationLink,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser({ email, password });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhotoUrl: user.profilePhotoUrl || null,
    },
  });
});

exports.logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

exports.me = asyncHandler(async (req, res) => {
  // Fetch full user for consistent UI hydration (photo + name).
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePhotoUrl: true,
      emailVerified: true,
    },
  });

  res.json({ user });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const result = await verifyEmailToken({ token });
  res.json({ message: 'Email verified successfully', ...result });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const result = await requestPasswordReset({ email, baseUrl });
  res.json(result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await resetPasswordWithToken({ token, password });
  res.json({ message: 'Password reset successfully' });
});