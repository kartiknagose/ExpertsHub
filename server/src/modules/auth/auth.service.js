const prisma = require('../../config/prisma');
const { hashPassword, comparePassword } = require('../../common/utils/bcrypt');
const { signJwt } = require('../../common/utils/jwt');

async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  const token = signJwt({ id: user.id, role: user.role });
  return { user, token };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const token = signJwt({ id: user.id, role: user.role });
  return { user, token };
}

module.exports = { registerUser, loginUser };