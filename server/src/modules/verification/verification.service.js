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

  const updatedApp = await prisma.workerVerificationApplication.update({
    where: { id: applicationId },
    data: {
      status: data.status,
      score: data.score ?? application.score,
      notes: data.notes ?? application.notes,
      reviewedAt: new Date(),
    },
  });

  // Sync verification status with WorkerProfile
  if (data.status === 'APPROVED' || data.status === 'REJECTED') {
    try {
      await prisma.workerProfile.update({
        where: { userId: application.userId },
        data: {
          isVerified: data.status === 'APPROVED',
          isProbation: data.status !== 'APPROVED', // Remove probation if approved
        }
      });
    } catch (error) {
      console.error('Failed to update worker profile verification status:', error);
      // Don't fail the request, just log it. The application status is updated.
    }
  }

  return updatedApp;
}

module.exports = {
  getMyApplication,
  applyForVerification,
  listApplications,
  reviewApplication,
};
