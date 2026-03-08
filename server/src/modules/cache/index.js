// Register cache routes in main Express app
const cacheRoutes = require('./cache.routes');

module.exports = function(app) {
  app.use('/api/cache', cacheRoutes);
};
