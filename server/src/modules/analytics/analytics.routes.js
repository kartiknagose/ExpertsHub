const { Router } = require('express');
const auth = require('../../middleware/auth');
const { requireRole } = require('../../middleware/requireRole');
const analyticsController = require('./analytics.controller');

const router = Router();

// Secure admin analytics endpoints
router.get('/summary', auth, requireRole('ADMIN'), analyticsController.getAdminSummary);

module.exports = router;
