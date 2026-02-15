const prisma = require('../../config/prisma');

async function getDashboardStats() {
  const [users, workers, services, bookings, pendingBookings, pendingVerifications] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'WORKER' } }),
    prisma.service.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.workerVerificationApplication.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    users,
    workers,
    services,
    bookings,
    pendingBookings,
    pendingVerifications,
  };
}

async function listUsers(role) {
  const where = role ? { role } : undefined;
  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
      emailVerified: true,
      profilePhotoUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function listWorkers() {
  return prisma.workerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          profilePhotoUrl: true,
        },
      },
      services: {
        include: {
          service: { select: { id: true, name: true, category: true } },
        },
      },
    },
    orderBy: { id: 'desc' },
  });
}

async function updateUserStatus(userId, isActive) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}

async function deleteUser(userId) {
  return prisma.user.delete({
    where: { id: userId },
  });
}

module.exports = {
  getDashboardStats,
  listUsers,
  listWorkers,
  updateUserStatus,
  deleteUser,
};
