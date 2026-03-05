const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');

/**
 * Update worker real-time location
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

    return location;
}

/**
 * Get location of a specific worker
 */
async function getWorkerLocation(workerProfileId) {
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

module.exports = {
    updateLocation,
    getWorkerLocation,
    getNearbyWorkers
};
