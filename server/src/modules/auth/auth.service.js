const prisma = require('../../config/prisma');
const { hashPassword, comparePassword } = require('../../common/utils/bcrypt');
const { signJwt } = require('../../common/utils/jwt');
const { generateEmailVerificationToken, generatePasswordResetToken } = require('../../common/utils/tokenGenerator');

async function registerUser({ name, email, mobile, password }) {
  const passwordHash = await hashPassword(password);
  const { token: verificationToken, expiresAt } = generateEmailVerificationToken();
  
  // Atomic transaction: check uniqueness and create user together (prevents race condition)
  const user = await prisma.$transaction(async (tx) => {
    // Check email uniqueness within transaction
    const existingEmail = await tx.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error('Email already registered');
    
    // Check mobile uniqueness within transaction
    const existingMobile = await tx.user.findUnique({ where: { mobile } });
    if (existingMobile) throw new Error('Mobile number already registered');
    
    // Create user and email verification atomically (all or nothing)
    return await tx.user.create({
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
  });
  
  const jwtToken = signJwt({ id: user.id, role: user.role });
  return { 
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: jwtToken,
    verificationToken 
  };
}

async function registerWorker({ name, email, mobile, password }) {
  const passwordHash = await hashPassword(password);
  const { token: verificationToken, expiresAt } = generateEmailVerificationToken();
  
  // Atomic transaction: check uniqueness and create user together (prevents race condition)
  const user = await prisma.$transaction(async (tx) => {
    // Check email uniqueness within transaction
    const existingEmail = await tx.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error('Email already registered');
    
    // Check mobile uniqueness within transaction
    const existingMobile = await tx.user.findUnique({ where: { mobile } });
    if (existingMobile) throw new Error('Mobile number already registered');
    
    // Create user with WORKER role and EmailVerification atomically
    return await tx.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        role: 'WORKER',
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
  if (!user.emailVerified) throw new Error('Email not verified');
  const token = signJwt({ id: user.id, role: user.role });
  return { user, token };
}

async function verifyEmailToken({ token }) {
  const verification = await prisma.emailVerification.findUnique({ where: { token } });
  if (!verification) throw new Error('Invalid or expired verification link');
  if (verification.verified) throw new Error('Email already verified');
  if (new Date() > verification.expiresAt) throw new Error('Verification link expired');

  // Atomic transaction: update both records together
  await prisma.$transaction(async (tx) => {
    // Update EmailVerification record
    await tx.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    // Update User record
    await tx.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() }
    });
  });

  // Fetch user role and profile completion info for redirect decisions
  const user = await prisma.user.findUnique({
    where: { id: verification.userId },
    include: {
      workerProfile: true,
      addresses: { take: 1 },
    },
  });

  return {
    userId: verification.userId,
    email: verification.email,
    role: user?.role,
    hasWorkerProfile: Boolean(user?.workerProfile),
    hasAddress: Boolean(user?.addresses?.length),
    isProfileComplete: Boolean(user?.isProfileComplete),
  };
}

async function requestPasswordReset({ email, baseUrl }) {
  // Always respond with success to avoid account enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { message: 'If an account exists, a reset link has been created.' };
  }

  const { token, expiresAt } = generatePasswordResetToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  return {
    message: 'If an account exists, a reset link has been created.',
    resetLink,
  };
}

async function resetPasswordWithToken({ token, password }) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) throw new Error('Invalid or expired reset token');
  if (resetToken.used) throw new Error('Reset token already used');
  if (new Date() > resetToken.expiresAt) throw new Error('Reset token expired');

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });
  });
}

module.exports = {
  registerUser,
  registerWorker,
  loginUser,
  verifyEmailToken,
  requestPasswordReset,
  resetPasswordWithToken,
};
