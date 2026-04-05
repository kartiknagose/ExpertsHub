const { Router } = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { requireWorker, requireAdmin } = require('../../middleware/requireRole');
const { applyVerificationSchema } = require('./verification.schemas');
const { getMine, apply } = require('./verification.controller');

const router = Router();

router.get('/me', auth, requireWorker, getMine);
router.post('/apply', auth, requireWorker, applyVerificationSchema, validate, apply);

// Admin review routes
// Admin review routes moved to admin mount to avoid misrouting.
// New canonical location: /api/admin/verification
// Back-compat redirects (keep old /api/verification/admin paths working)
router.get('/admin', auth, requireAdmin, (req, res) => {
	const queryIndex = req.originalUrl.indexOf('?');
	const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
	return res.redirect(307, `/api/admin/verification${query}`);
});

router.patch('/admin/:id', auth, requireAdmin, (req, res) => {
	const queryIndex = req.originalUrl.indexOf('?');
	const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
	return res.redirect(307, `/api/admin/verification/${req.params.id}${query}`);
});

module.exports = router;
