const { Router } = require('express');
const auth = require('../../middleware/auth');
const { requireRole, requireAdmin } = require('../../middleware/requireRole');
const { paymentWebhookLimiter } = require('../../config/rateLimit');
const { listMine, razorpayWebhook } = require('./payment.controller');

const router = Router();

// Payments for the logged-in user (Customer OR Worker)
router.get('/me', auth, requireRole('CUSTOMER', 'WORKER'), listMine);

// Admin payments
// Admin payments moved to admin mount to avoid misrouting.
// New canonical location: /api/admin/payments
// Back-compat redirect for legacy path: /api/payments/admin
router.get('/admin', auth, requireAdmin, (req, res) => {
	const queryIndex = req.originalUrl.indexOf('?');
	const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
	return res.redirect(307, `/api/admin/payments${query}`);
});

// Razorpay Webhook (public endpoint)
router.post('/webhook', paymentWebhookLimiter, razorpayWebhook);

module.exports = router;
