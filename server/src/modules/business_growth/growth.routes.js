const { Router } = require('express');
const auth = require('../../middleware/auth');
const GrowthController = require('./growth.controller');

const router = Router();

// Wallet Routes
router.get('/wallet', auth, GrowthController.getWallet);
router.post('/wallet/topup/order', auth, GrowthController.createWalletTopupOrder);
router.post('/wallet/topup/confirm', auth, GrowthController.confirmWalletTopup);
router.post('/wallet/add', auth, GrowthController.addCredits);

// Referral Routes
router.get('/referrals', auth, GrowthController.getReferralInfo);
router.post('/referrals/apply', auth, GrowthController.applyReferralCode);

// Coupon Validation (Checkout)
router.post('/coupons/validate', auth, GrowthController.checkCoupon);

// ── Favorite Workers (Sprint 17 - #80) ──────────────────────────
router.post('/favorites/toggle', auth, GrowthController.toggleFavorite);
router.get('/favorites', auth, GrowthController.getFavorites);
router.get('/favorites/ids', auth, GrowthController.getFavoriteIds);
router.get('/favorites/check/:workerProfileId', auth, GrowthController.checkFavorite);

// ── Loyalty Points (Sprint 17 - #75) ────────────────────────────
router.get('/loyalty', auth, GrowthController.getLoyaltySummary);
router.post('/loyalty/redeem', auth, GrowthController.redeemPoints);

// ── UrbanPro Plus (Sprint 17 - #74) ─────────────────────────────
router.get('/proplus', auth, GrowthController.getProPlusSubscription);
router.post('/proplus/subscribe', auth, GrowthController.subscribeProPlus);
router.post('/proplus/cancel', auth, GrowthController.cancelProPlus);

// ── Gift Cards (Sprint 17 - #76) ────────────────────────────────
router.post('/giftcards/purchase', auth, GrowthController.purchaseGiftCard);
router.post('/giftcards/redeem', auth, GrowthController.redeemGiftCard);
router.get('/giftcards/check/:code', auth, GrowthController.checkGiftCard);

module.exports = router;

