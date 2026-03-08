const { Router } = require('express');
const auth = require('../../middleware/auth');
const GrowthController = require('./growth.controller');

const router = Router();

// Wallet Routes
router.get('/wallet', auth, GrowthController.getWallet);
router.post('/wallet/add', auth, GrowthController.addCredits);

// Referral Routes
router.get('/referrals', auth, GrowthController.getReferralInfo);
router.post('/referrals/apply', auth, GrowthController.applyReferralCode);

// Coupon Validation (Checkout)
router.post('/coupons/validate', auth, GrowthController.checkCoupon);

module.exports = router;
