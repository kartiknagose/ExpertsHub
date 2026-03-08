
/**
 * Request ID Middleware
 * - Generates a unique ID for every request
 * - Attaches it to req.id and X-Request-Id header
 * - Allows tracking logs back to a specific request
 */
function requestIdMiddleware(req, res, next) {
    const requestId = req.get('X-Request-Id') ||
        (Math.random().toString(36).substring(2, 10) + Date.now().toString(36));

    req.id = requestId;
    res.set('X-Request-Id', requestId);
    next();
}

module.exports = requestIdMiddleware;
