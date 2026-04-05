const { Router } = require('express');
const auth = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/requireRole');
const { listAll } = require('./payment.controller');

const router = Router();

// Admin payments list (mounted under /api/admin/payments)
router.get('/', auth, requireAdmin, listAll);

module.exports = router;
