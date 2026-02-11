const { Router } = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { requireWorker, requireAdmin } = require('../../middleware/requireRole');
const { applyVerificationSchema, reviewVerificationSchema } = require('./verification.schemas');
const { getMine, apply, listAll, review } = require('./verification.controller');

const router = Router();

router.get('/me', auth, requireWorker, getMine);
router.post('/apply', auth, requireWorker, applyVerificationSchema, validate, apply);

// Admin review routes
router.get('/admin', auth, requireAdmin, listAll);
router.patch('/admin/:id', auth, requireAdmin, reviewVerificationSchema, validate, review);

module.exports = router;
