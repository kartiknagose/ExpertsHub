const prisma = require('../../config/prisma');

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
    throw new Error('Verification already in progress or approved.');
  }

  return prisma.workerVerificationApplication.create({
    data: {
      userId,
      notes: data.notes || null,
      status: 'PENDING',
    },
  });
}

async function listApplications() {
  return prisma.workerVerificationApplication.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, mobile: true } },
      documents: true,
      references: true,
      media: true,
    },
  });
}

async function reviewApplication(applicationId, data) {
  const application = await prisma.workerVerificationApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error('Verification application not found.');
  }

  return prisma.workerVerificationApplication.update({
    where: { id: applicationId },
    data: {
      status: data.status,
      score: data.score ?? application.score,
      notes: data.notes ?? application.notes,
      reviewedAt: new Date(),
    },
  });
}

module.exports = {
  getMyApplication,
  applyForVerification,
  listApplications,
  reviewApplication,
};
