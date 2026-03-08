// Express routes for Redis cache endpoints
const express = require('express');
const { serviceCatalogCache, workerProfileCache } = require('./cache.middleware');
const router = express.Router();

router.get('/service-catalog', serviceCatalogCache);
router.get('/worker-profile/:id', workerProfileCache);

module.exports = router;
