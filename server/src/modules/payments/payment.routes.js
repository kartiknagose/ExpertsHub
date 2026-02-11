const { Router } = require('express');
const auth = require('../../middleware/auth');
const { requireCustomer, requireAdmin } = require('../../middleware/requireRole');
const { listMine, listAll } = require('./payment.controller');

const router = Router();

// Customer payments
router.get('/me', auth, requireCustomer, listMine);

// Admin payments
router.get('/admin', auth, requireAdmin, listAll);

module.exports = router;
