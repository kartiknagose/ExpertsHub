const asyncHandler = require('../../common/utils/asyncHandler');
const AppError = require('../../common/errors/AppError');
const locationService = require('./location.service');
const { getIo } = require('../../socket');

const updateLocation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { latitude, longitude, isOnline } = req.body;

    if (latitude === undefined || longitude === undefined) {
        throw new AppError(400, 'Latitude and longitude are required');
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
        throw new AppError(400, 'Latitude and longitude must be valid numbers');
    }

    if (parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) {
        throw new AppError(400, 'Latitude/longitude out of valid range');
    }

    let parsedIsOnline;
    if (typeof isOnline === 'string') {
        parsedIsOnline = isOnline.toLowerCase() === 'true';
    } else if (typeof isOnline === 'boolean') {
        parsedIsOnline = isOnline;
    } else if (isOnline === undefined || isOnline === null) {
        parsedIsOnline = undefined;
    } else {
        parsedIsOnline = Boolean(isOnline);
    }

    const location = await locationService.updateLocation(userId, {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        isOnline: parsedIsOnline
    });

    // Broadcast update to anyone listening for this worker
    const io = getIo();
    io.to(`worker_tracking:${location.workerProfileId}`).emit('worker:location_updated', {
        workerProfileId: location.workerProfileId,
        latitude: location.latitude,
        longitude: location.longitude,
        isOnline: location.isOnline,
        lastUpdated: location.lastUpdated
    });

    // Optionally broadcast to admin room if it's a critical update or for health monitoring
    if (isOnline === false) {
        io.to('admin').emit('worker:offline', { workerId: userId });
    }

    res.json({ success: true, location });
});

const getWorkerLocation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const location = await locationService.getWorkerLocation(parseInt(id));

    res.json({ location: location || null });
});

const getNearbyWorkers = asyncHandler(async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
        throw new AppError(400, 'Latitude and longitude are required');
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const parsedRadius = radius ? Number(radius) : 10;

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
        throw new AppError(400, 'Latitude and longitude must be valid numbers');
    }

    if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
        throw new AppError(400, 'Latitude/longitude out of valid range');
    }

    if (!Number.isFinite(parsedRadius) || parsedRadius <= 0 || parsedRadius > 100) {
        throw new AppError(400, 'Radius must be a number between 1 and 100 km');
    }

    const workers = await locationService.getNearbyWorkers(
        parsedLat,
        parsedLng,
        Math.round(parsedRadius)
    );

    res.json({ workers });
});

module.exports = {
    updateLocation,
    getWorkerLocation,
    getNearbyWorkers
};
