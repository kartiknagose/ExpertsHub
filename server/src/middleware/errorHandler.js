/**
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * 
 * Catches all errors thrown in routes/controllers
 * Logs them for debugging and returns appropriate HTTP response
 */

module.exports = (err, _req, res, _next) => {
  // Determine HTTP status code
  const status = err.statusCode || err.status || 500;
  
  // Use custom message if available, otherwise generic message
  const message = err.message || 'Internal Server Error';

  // Log error details in development and production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, log full error with stack trace
    console.error('❌ ERROR:', {
      status,
      message,
      stack: err.stack,
      url: _req.originalUrl,
      method: _req.method,
    });
  } else {
    // In production, log without sensitive stack details
    console.error('❌ ERROR:', {
      status,
      message,
      url: _req.originalUrl,
      method: _req.method,
      // Could be sent to monitoring service like Sentry here
    });
  }

  // Send error response to client
  res.status(status).json({
    error: message,
    statusCode: status,
    ...(isDevelopment && { stack: err.stack }),
  });
};