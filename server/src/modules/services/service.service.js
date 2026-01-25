const prisma = require('../../config/prisma');

// Fetch all services, optional category filter
async function listServices({ category } = {}) {
  const where = category ? { category } : {};
  return prisma.service.findMany({ where, orderBy: { name: 'asc' } });
}

// Fetch a single service by id
async function getServiceById(id) {
  return prisma.service.findUnique({ where: { id } });
}

module.exports = { listServices, getServiceById };