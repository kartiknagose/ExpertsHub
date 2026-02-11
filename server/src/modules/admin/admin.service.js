const prisma = require('../../config/prisma');

async function getDashboardStats() {
  const [users, workers, services, bookings, pendingBookings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'WORKER' } }),
    prisma.service.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    users,
    workers,
    services,
    bookings,
    pendingBookings,
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

module.exports = {
  getDashboardStats,
  listUsers,
  listWorkers,
};
