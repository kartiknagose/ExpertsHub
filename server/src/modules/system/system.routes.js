const { Router } = require('express');
const { reportClientError } = require('./system.controller');

const router = Router();

// Endpoint for the React client to report unhandled exceptions (Mock Sentry)
router.post('/report-error', reportClientError);

module.exports = router;
