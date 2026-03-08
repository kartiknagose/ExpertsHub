const asyncHandler = require('../../common/utils/asyncHandler');
const logger = require('../../config/logger');

/**
 * Handle CLIENT-SIDE error reports (Mock Sentry)
 */
const reportClientError = asyncHandler(async (req, res) => {
    const { error, info } = req.body;

    logger.error(`[CLIENT_CRASH] ${error?.message || 'Unknown Error'}`, {
        stack: error?.stack,
        componentStack: info?.componentStack,
        url: req.get('referer'),
        userAgent: req.get('user-agent'),
        requestId: req.id
    });

    res.status(204).end();
});

module.exports = {
    reportClientError
};
