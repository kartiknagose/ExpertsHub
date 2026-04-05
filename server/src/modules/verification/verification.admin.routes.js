const { Router } = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { requireAdmin } = require('../../middleware/requireRole');
const { listApplicationsQuerySchema, reviewVerificationSchema } = require('./verification.schemas');
const { listAll, review } = require('./verification.controller');

const router = Router();

// Admin review routes (mounted under /api/admin/verification)
router.get('/', auth, requireAdmin, listApplicationsQuerySchema, validate, listAll);
router.patch('/:id', auth, requireAdmin, reviewVerificationSchema, validate, review);

module.exports = router;
