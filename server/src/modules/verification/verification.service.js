const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');

async function getMyApplication(userId) {
  return prisma.workerVerificationApplication.findFirst({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
    include: {
      documents: true,
      references: true,
      media: true,
    },
  });
}

async function applyForVerification(userId, data) {
  const latest = await prisma.workerVerificationApplication.findFirst({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
  });

  if (latest && (latest.status === 'PENDING' || latest.status === 'APPROVED')) {
    throw new AppError(409, 'Verification already in progress or approved.');
  }

  return prisma.workerVerificationApplication.create({
    data: {
      userId,
      notes: data.notes || null,
      status: 'PENDING',
      documents: {
        create: (data.documents || []).map((doc) => ({
          type: doc.type,
          url: doc.url,
        })),
      },
    },
    include: {
      documents: true,
    },
  });
}

async function listApplications({ skip = 0, limit = 20 } = {}) {
  const [data, total] = await Promise.all([
    prisma.workerVerificationApplication.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true } },
        documents: true,
        references: true,
        media: true,
      },
      skip,
      take: limit,
    }),
    prisma.workerVerificationApplication.count(),
  ]);
  return { data, total };
}

async function reviewApplication(applicationId, data) {
  const application = await prisma.workerVerificationApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError(404, 'Verification application not found.');
  }

  // Wrap application update + profile sync in a transaction
  const updatedApp = await prisma.$transaction(async (tx) => {
    const updated = await tx.workerVerificationApplication.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        score: data.score ?? application.score,
        notes: data.notes ?? application.notes,
        reviewedAt: new Date(),
      },
    });

    // Sync verification status with WorkerProfile
    if (data.status === 'APPROVED' || data.status === 'REJECTED' || data.level) {
      const level = data.level || (data.status === 'APPROVED' ? 'VERIFIED' : 'BASIC');

      await tx.workerProfile.update({
        where: { userId: application.userId },
        data: {
          isVerified: data.status === 'APPROVED',
          isProbation: data.status !== 'APPROVED',
          verificationScore: data.score ?? application.score,
          verificationLevel: level,
        },
      });
    }

    return updated;
  });

  return updatedApp;
}

module.exports = {
  getMyApplication,
  applyForVerification,
  listApplications,
  reviewApplication,
};
