const prisma = require('../../config/prisma');

const GST_RATE = 0.18; // 18%
const DISTANCE_OZONE_KM = 5; // First 5km is free
const DISTANCE_FEE_PER_KM = 10; // ₹10 per km after 5km

/**
 * Calculate dynamic price for a booking based on Sprint 9 requirements
 */
async function calculateDynamicPrice({
    serviceId,
    workerProfileId, // Optional, if directly assigned
    scheduledAt,
    latitude,
    longitude,
    basePriceOverride // From UI, but server recalculates anyway
}) {
    const service = await prisma.service.findUnique({
        where: { id: serviceId }
    });

    if (!service) throw new Error('Service not found');

    let basePrice = Number(service.basePrice) || basePriceOverride || 0;

    // 1. Time-of-day / Weekend Multiplier
    let timeMultiplier = 1.0;
    const deliveryDate = new Date(scheduledAt);
    const hour = deliveryDate.getHours();
    const day = deliveryDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (day === 0 || day === 6) {
        timeMultiplier = 1.3; // Weekend premium
    } else if (hour >= 18 || hour < 6) {
        timeMultiplier = 1.2; // Evening/Night premium (6 PM to 6 AM)
    }

    // 2. Urgency Multiplier
    let urgencyMultiplier = 1.0;
    const now = new Date();
    const hoursUntilJob = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilJob <= 2) {
        urgencyMultiplier = 1.5; // Within 2 hours
    } else if (hoursUntilJob <= 24 && deliveryDate.toDateString() === now.toDateString()) {
        urgencyMultiplier = 1.2; // Same-day
    }

    // 3. Demand/Supply Surge Multiplier (Real-time DB query)
    let surgeMultiplier = 1.0;
    try {
        const pendingCount = await prisma.booking.count({
            where: { serviceId, status: 'PENDING' }
        });
        const activeWorkers = await prisma.workerLocation.count({
            where: {
                isOnline: true,
                workerProfile: {
                    services: { some: { serviceId } }
                }
            }
        });

        // Ratio: If more pending jobs than active workers -> Surge
        const effectiveWorkers = Math.max(activeWorkers, 1); // Avoid div by 0
        const ratio = pendingCount / effectiveWorkers;

        // Cap ratio impact between 1.0x and 2.0x max
        if (ratio > 1) {
            surgeMultiplier = Math.min(1.0 + (ratio * 0.1), 2.0); // Rough curve
        }
    } catch (_e) { /* Ignore surge failure and fallback to 1.0 */ }


    // 4. Worker Tier Multiplier (If worker selected, or we average it out? Usually 1.0 if open booking)
    let workerTierMultiplier = 1.0;
    let distanceSurcharge = 0.0;

    if (workerProfileId) {
        const worker = await prisma.workerProfile.findUnique({
            where: { id: workerProfileId }
        });

        if (worker) {
            if (worker.verificationLevel === 'PREMIUM') workerTierMultiplier = 1.15;
            else if (worker.verificationLevel === 'VERIFIED') workerTierMultiplier = 1.0;
            else workerTierMultiplier = 0.9; // BASIC / DOCUMENTS = promotional

            // Calculate specific distance from worker to job if lat/long match
            if (worker.baseLatitude && worker.baseLongitude && latitude && longitude) {
                const distKm = getDistanceFromLatLonInKm(
                    latitude, longitude, worker.baseLatitude, worker.baseLongitude
                );
                if (distKm > DISTANCE_OZONE_KM) {
                    distanceSurcharge = (distKm - DISTANCE_OZONE_KM) * DISTANCE_FEE_PER_KM;
                }
            }
        }
    }

    // We should round multipliers to 2 decimals for cleanliness
    surgeMultiplier = Math.round(surgeMultiplier * 100) / 100;

    // Calculate Subtotal (Base * multipliers)
    const modifiedBase = basePrice * timeMultiplier * surgeMultiplier * urgencyMultiplier * workerTierMultiplier;

    // Surcharge added strictly *after* multipliers
    const subtotal = modifiedBase + distanceSurcharge;

    // Tax computed on the final subtotal
    const gstAmount = subtotal * GST_RATE;
    const totalPrice = subtotal + gstAmount;

    return {
        basePrice,
        timeMultiplier,
        surgeMultiplier,
        urgencyMultiplier,
        workerTierMultiplier,
        distanceSurcharge: Math.round(distanceSurcharge * 100) / 100,
        gstAmount: Math.round(gstAmount * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100
    };
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

module.exports = {
    calculateDynamicPrice
};
