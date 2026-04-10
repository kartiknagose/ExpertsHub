const { Router } = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { requireAdmin } = require('../../middleware/requireRole');
const GrowthController = require('./growth.controller');
const {
	walletTopupOrderSchema,
	walletTopupConfirmSchema,
	walletTopupFailSchema,
	walletRedeemSchema,
	walletAddCreditsSchema,
	applyReferralSchema,
	validateCouponSchema,
	toggleFavoriteSchema,
	workerProfileIdParamSchema,
	redeemPointsSchema,
	subscribeProPlusSchema,
	purchaseGiftCardSchema,
	redeemGiftCardSchema,
} = require('./growth.schemas');
const {
	walletTopupCreateLimiter,
	walletTopupVerifyLimiter,
	walletRedeemLimiter,
} = require('../../config/rateLimit');

const router = Router();
const requireVerifiedEmail = require('../../middleware/requireVerifiedEmail');

// Wallet Routes
router.get('/wallet', auth, GrowthController.getWallet);
router.post('/wallet/topup/order', auth, requireVerifiedEmail, walletTopupCreateLimiter, walletTopupOrderSchema, validate, GrowthController.createWalletTopupOrder);
router.post('/wallet/topup/confirm', auth, requireVerifiedEmail, walletTopupVerifyLimiter, walletTopupConfirmSchema, validate, GrowthController.confirmWalletTopup);
router.post('/wallet/topup/fail', auth, requireVerifiedEmail, walletTopupVerifyLimiter, walletTopupFailSchema, validate, GrowthController.failWalletTopup);
router.post('/wallet/redeem', auth, requireVerifiedEmail, walletRedeemLimiter, walletRedeemSchema, validate, GrowthController.redeemWalletBalance);
router.post('/wallet/add', auth, requireAdmin, walletAddCreditsSchema, validate, GrowthController.addCredits);

// Referral Routes
router.get('/referrals', auth, GrowthController.getReferralInfo);
router.post('/referrals/apply', auth, requireVerifiedEmail, applyReferralSchema, validate, GrowthController.applyReferralCode);

// Coupon Validation (Checkout)
router.post('/coupons/validate', auth, validateCouponSchema, validate, GrowthController.checkCoupon);

// ── Favorite Workers (Sprint 17 - #80) ──────────────────────────
router.post('/favorites/toggle', auth, toggleFavoriteSchema, validate, GrowthController.toggleFavorite);
router.get('/favorites', auth, GrowthController.getFavorites);
router.get('/favorites/ids', auth, GrowthController.getFavoriteIds);
router.get('/favorites/check/:workerProfileId', auth, workerProfileIdParamSchema, validate, GrowthController.checkFavorite);

// ── Loyalty Points (Sprint 17 - #75) ────────────────────────────
router.get('/loyalty', auth, GrowthController.getLoyaltySummary);
router.post('/loyalty/redeem', auth, requireVerifiedEmail, redeemPointsSchema, validate, GrowthController.redeemPoints);

// ── ExpertsHub Plus (Sprint 17 - #74) ─────────────────────────────
router.get('/proplus', auth, GrowthController.getProPlusSubscription);
router.post('/proplus/subscribe', auth, requireVerifiedEmail, subscribeProPlusSchema, validate, GrowthController.subscribeProPlus);
router.post('/proplus/cancel', auth, requireVerifiedEmail, GrowthController.cancelProPlus);

// ── Gift Cards (Sprint 17 - #76) ────────────────────────────────
router.post('/giftcards/purchase', auth, requireVerifiedEmail, purchaseGiftCardSchema, validate, GrowthController.purchaseGiftCard);
router.post('/giftcards/redeem', auth, requireVerifiedEmail, redeemGiftCardSchema, validate, GrowthController.redeemGiftCard);
router.get('/giftcards/check/:code', auth, GrowthController.checkGiftCard);

module.exports = router;

