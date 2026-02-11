const prisma = require('../../config/prisma');

async function listMyPayments(userId) {
  return prisma.payment.findMany({
    where: { customerId: userId },
    include: {
      booking: {
        include: { service: { select: { id: true, name: true, category: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function listAllPayments() {
  return prisma.payment.findMany({
    include: {
      booking: {
        include: { service: { select: { id: true, name: true, category: true } } },
      },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  listMyPayments,
  listAllPayments,
};
