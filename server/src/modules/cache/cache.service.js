// Service for Redis caching: service catalog and worker profiles
const redis = require('../../config/redis');
const SERVICE_CATALOG_KEY = 'service_catalog';
const WORKER_PROFILE_KEY = (id) => `worker_profile:${id}`;

module.exports = {
  async getServiceCatalog() {
    const cached = await redis.get(SERVICE_CATALOG_KEY);
    if (cached) return JSON.parse(cached);
    // Fetch from DB and cache
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const services = await prisma.service.findMany();
    await redis.set(SERVICE_CATALOG_KEY, JSON.stringify(services), 'EX', 300); // 5min TTL
    return services;
  },

  async invalidateServiceCatalog() {
    await redis.del(SERVICE_CATALOG_KEY);
  },

  async getWorkerProfile(id) {
    const cached = await redis.get(WORKER_PROFILE_KEY(id));
    if (cached) return JSON.parse(cached);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const profile = await prisma.workerProfile.findUnique({
      where: { id },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true,
            rating: true,
            totalReviews: true,
            reviewsReceived: {
              include: {
                reviewer: {
                  select: { id: true, name: true, profilePhotoUrl: true }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        services: {
          include: { 
            service: {
              select: { id: true, name: true, category: true }
            }
          }
        }
      }
    });
    await redis.set(WORKER_PROFILE_KEY(id), JSON.stringify(profile), 'EX', 120); // 2min TTL
    return profile;
  },

  async invalidateWorkerProfile(id) {
    await redis.del(WORKER_PROFILE_KEY(id));
  }
};
