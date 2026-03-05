const prisma = require('../../config/prisma');

async function listMyPayments(userId, role, { skip = 0, limit = 20 } = {}) {
  const where =
    role === 'WORKER'
      ? { booking: { workerProfile: { userId } } }
      : { customerId: userId };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: { service: { select: { id: true, name: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);
  return { data, total };
}

async function listAllPayments({ skip = 0, limit = 20 } = {}) {
  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      include: {
        booking: {
          include: { service: { select: { id: true, name: true, category: true } } },
        },
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count(),
  ]);
  return { data, total };
}

module.exports = {
  listMyPayments,
  listAllPayments,
};
