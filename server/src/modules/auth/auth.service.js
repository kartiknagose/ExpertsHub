const prisma = require('../../config/prisma');
const { hashPassword, comparePassword } = require('../../common/utils/bcrypt');
const { signJwt } = require('../../common/utils/jwt');
const { generateEmailVerificationToken } = require('../../common/utils/tokenGenerator');

async function registerUser({ name, email, mobile, password }) {
  // Check email and mobile uniqueness
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error('Email already registered');
  
  const existingMobile = await prisma.user.findUnique({ where: { mobile } });
  if (existingMobile) throw new Error('Mobile number already registered');
  
  const passwordHash = await hashPassword(password);
  const { token: verificationToken, expiresAt } = generateEmailVerificationToken();
  
  // Create user and email verification in transaction
  const user = await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      passwordHash,
      role: 'CUSTOMER',
      emailVerifications: {
        create: {
          email,
          token: verificationToken,
          expiresAt,
        }
      }
    },
    include: { emailVerifications: true }
  });
  
  const jwtToken = signJwt({ id: user.id, role: user.role });
  return { 
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: jwtToken,
    verificationToken 
  };
}

async function registerWorker({ name, email, mobile, password, bio, skills, hourlyRate, serviceAreas }) {
  // Check email and mobile uniqueness
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error('Email already registered');
  
  const existingMobile = await prisma.user.findUnique({ where: { mobile } });
  if (existingMobile) throw new Error('Mobile number already registered');
  
  const passwordHash = await hashPassword(password);
  const { token: verificationToken, expiresAt } = generateEmailVerificationToken();
  
  // Create user with WORKER role, WorkerProfile, and EmailVerification in transaction
  const user = await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      passwordHash,
      role: 'WORKER',
      workerProfile: {
        create: {
          bio: bio || '',
          skills: skills || [],
          hourlyRate: hourlyRate || 0,
          serviceAreas: serviceAreas || [],
        }
      },
      emailVerifications: {
        create: {
          email,
          token: verificationToken,
          expiresAt,
        }
      }
    },
    include: { workerProfile: true, emailVerifications: true }
  });
  
  const jwtToken = signJwt({ id: user.id, role: user.role });
  return { 
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: jwtToken,
    verificationToken 
  };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const token = signJwt({ id: user.id, role: user.role });
  return { user, token };
}

async function verifyEmailToken({ token }) {
  const verification = await prisma.emailVerification.findUnique({ where: { token } });
  if (!verification) throw new Error('Invalid or expired verification link');
  if (verification.verified) throw new Error('Email already verified');
  if (new Date() > verification.expiresAt) throw new Error('Verification link expired');

  // Update EmailVerification record
  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: { verified: true }
  });

  // Update User record
  await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerified: true }
  });

  return { userId: verification.userId, email: verification.email };
}

module.exports = { registerUser, registerWorker, loginUser, verifyEmailToken };
