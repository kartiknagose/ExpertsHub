/**
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * Catches all errors thrown in routes/controllers.
 * Logs via Winston and returns appropriate HTTP response.
 */

const logger = require('../config/logger');
const { captureException } = require('../config/monitoring');

module.exports = (err, _req, res, _next) => {
  // Determine HTTP status code
  const status = err.statusCode || err.status || 500;

  // Use custom message if available, otherwise generic message
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    // CRASH REPORTING (Sprint 15)
    captureException(err, {
      url: _req.originalUrl,
      method: _req.method,
      id: _req.id
    });
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log via Winston — error level for 5xx, warn for 4xx
  const logLevel = status >= 500 ? 'error' : 'warn';
  logger[logLevel]('%s %s → %d: %s', _req.method, _req.originalUrl, status, message, {
    ...(isDevelopment && { stack: err.stack }),
  });

  // Send error response to client
  res.status(status).json({
    error: message,
    statusCode: status,
    ...(isDevelopment && { stack: err.stack }),
  });
};