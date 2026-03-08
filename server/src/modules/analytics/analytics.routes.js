const { Router } = require('express');
const auth = require('../../middleware/auth');
const adminOnly = require('../../middleware/admin');
const analyticsController = require('./analytics.controller');

const router = Router();

// Secure admin analytics endpoints
router.get('/summary', auth, adminOnly, analyticsController.getAdminSummary);

module.exports = router;
