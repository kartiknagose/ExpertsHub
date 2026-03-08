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

async function listUsers(role, { skip = 0, limit = 20 } = {}) {
  const where = role ? { role } : undefined;
  const [data, total] = await Promise.all([
    prisma.user.findMany({
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
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  return { data, total };
}

async function listWorkers({ skip = 0, limit = 20 } = {}) {
  const [data, total] = await Promise.all([
    prisma.workerProfile.findMany({
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
      skip,
      take: limit,
    }),
    prisma.workerProfile.count(),
  ]);
  return { data, total };
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

/**
 * Get Suspicious Activity Alerts
 */
async function getFraudAlerts() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [highCancellers, badWorkers] = await Promise.all([
    // Users who cancelled > 2 bookings in last hour
    prisma.user.findMany({
      where: {
        bookingsCustomer: {
          some: {
            status: 'CANCELLED',
            updatedAt: { gte: oneHourAgo }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: { bookingsCustomer: { where: { status: 'CANCELLED', updatedAt: { gte: oneHourAgo } } } }
        }
      }
    }),
    // Workers with multiple 1-star reviews
    prisma.workerProfile.findMany({
      where: {
        bookingsWorker: {
          some: {
            reviews: {
              some: { rating: { lte: 2 } }
            }
          }
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        _count: {
          select: { bookingsWorker: { where: { reviews: { some: { rating: { lte: 2 } } } } } }
        }
      },
      take: 10
    })
  ]);

  return {
    highCancellers: highCancellers.filter(u => u._count.bookingsCustomer > 1).map(u => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      type: 'VELOCITY_ALERT',
      reason: `${u._count.bookingsCustomer} cancellations in 1 hour`,
      severity: 'HIGH'
    })),
    badWorkers: badWorkers.map(w => ({
      workerId: w.id,
      name: w.user.name,
      email: w.user.email,
      type: 'QUALITY_ALERT',
      reason: `${w._count.bookingsWorker} low ratings recently`,
      severity: 'MEDIUM'
    }))
  };
}

/**
 * Coupon Management (Sprint 17)
 */
async function createCoupon(data) {
  return prisma.coupon.create({
    data: {
      ...data,
      code: String(data.code).toUpperCase(),
    }
  });
}

async function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

async function toggleCoupon(id, isActive) {
  return prisma.coupon.update({
    where: { id },
    data: { isActive }
  });
}

async function deleteCoupon(id) {
  return prisma.coupon.delete({
    where: { id }
  });
}

module.exports = {
  getDashboardStats,
  listUsers,
  listWorkers,
  updateUserStatus,
  deleteUser,
  getFraudAlerts,
  createCoupon,
  listCoupons,
  toggleCoupon,
  deleteCoupon
};
