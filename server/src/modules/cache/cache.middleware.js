// Middleware to use Redis cache for service catalog and worker profile endpoints
const cacheService = require('./cache.service');

async function serviceCatalogCache(req, res, next) {
  try {
    const services = await cacheService.getServiceCatalog();
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

async function workerProfileCache(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const profile = await cacheService.getWorkerProfile(id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  serviceCatalogCache,
  workerProfileCache
};
