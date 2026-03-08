const { Router } = require('express');
const { getBankDetails, updateBankDetails, requestInstantPayout, getPayoutHistory } = require('./payout.controller');
const authenticate = require('../../middleware/auth');
const { requireWorker } = require('../../middleware/requireRole');

const router = Router();

// Worker Bank Details Routes
router.get('/bank-details', authenticate, requireWorker, getBankDetails);
router.post('/bank-details', authenticate, requireWorker, updateBankDetails);

// Worker Payout Routes
router.post('/instant', authenticate, requireWorker, requestInstantPayout);
router.get('/history', authenticate, requireWorker, getPayoutHistory);

module.exports = router;
