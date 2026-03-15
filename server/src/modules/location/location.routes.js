const express = require('express');
const router = express.Router();
const locationController = require('./location.controller');
const authenticate = require('../../middleware/auth');
const { requireWorker } = require('../../middleware/requireRole');

// Authenticated - Get nearby workers (requires login to protect worker GPS data)
router.get('/nearby', authenticate, locationController.getNearbyWorkers);

// Authenticated - Get specific worker location
router.get('/worker/:id', authenticate, locationController.getWorkerLocation);

// Worker only - Update real-time location
router.post('/update', authenticate, requireWorker, locationController.updateLocation);

// City Management (Sprint 17 - #83)
router.get('/cities', locationController.getCities);
router.get('/cities/:slug/services', locationController.getCityServices);

module.exports = router;

