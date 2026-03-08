const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');
const Redis = require('ioredis');

let redisClient = null;
try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry — fall back to DB
        lazyConnect: true,
    });
    redisClient.connect().catch(() => {
        console.warn('Location service: Redis unavailable, using database only');
        redisClient = null;
    });
} catch {
    console.warn('Location service: Redis unavailable, using database only');
    redisClient = null;
}

/**
 * Update worker real-time location and cache in Redis
 * @param {number} userId - User ID of the worker
 * @param {Object} data - { latitude, longitude, isOnline }
 */
async function updateLocation(userId, data) {
    const profile = await prisma.workerProfile.findUnique({
        where: { userId },
        select: { id: true }
    });

    if (!profile) {
        throw new AppError(404, 'Worker profile not found');
    }

    const location = await prisma.workerLocation.upsert({
        where: { workerProfileId: profile.id },
        create: {
            workerProfileId: profile.id,
            latitude: data.latitude,
            longitude: data.longitude,
            isOnline: data.isOnline ?? true,
            lastUpdated: new Date()
        },
        update: {
            latitude: data.latitude,
            longitude: data.longitude,
            isOnline: data.isOnline ?? true,
            lastUpdated: new Date()
        },
        include: {
            workerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            }
        }
    });

    // Cache location in Redis (if available)
    if (redisClient) {
        try {
            await redisClient.set(
                `worker_location:${profile.id}`,
                JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    isOnline: location.isOnline,
                    lastUpdated: location.lastUpdated
                }),
                'EX', 300 // 5 min TTL
            );
        } catch { /* Redis down, ignore */ }
    }

    return location;
}

/**
 * Get location of a specific worker (prefer Redis cache)
 */
async function getWorkerLocation(workerProfileId) {
    // Try Redis cache first (if available)
    if (redisClient) {
        try {
            const cached = await redisClient.get(`worker_location:${workerProfileId}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                return {
                    workerProfileId,
                    ...parsed
                };
            }
        } catch { /* Redis down, fall through to DB */ }
    }
    // Fallback to DB
    return prisma.workerLocation.findUnique({
        where: { workerProfileId },
        include: {
            workerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true, profilePhotoUrl: true }
                    }
                }
            }
        }
    });
}

/**
 * Get all online workers within a radius
 * (Simple box filter for now, can be improved with PostGIS if needed)
 */
async function getNearbyWorkers(lat, lng, radiusKm = 10) {
    // 1 degree latitude is approx 111km
    // 1 degree longitude is approx 111km * cos(lat)
    const latDelta = radiusKm / 111;
    const cosLatitude = Math.cos(lat * (Math.PI / 180));
    const safeCosLatitude = Math.max(Math.abs(cosLatitude), 0.01);
    const lngDelta = radiusKm / (111 * safeCosLatitude);

    return prisma.workerLocation.findMany({
        where: {
            isOnline: true,
            latitude: {
                gte: lat - latDelta,
                lte: lat + latDelta
            },
            longitude: {
                gte: lng - lngDelta,
                lte: lng + lngDelta
            }
        },
        include: {
            workerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true, profilePhotoUrl: true }
                    },
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            }
        }
    });
}

/**
 * Calculate distance between two points (Haversine formula) in KM
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

module.exports = {
    updateLocation,
    getWorkerLocation,
    getNearbyWorkers,
    calculateDistance
};
