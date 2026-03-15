import axiosInstance from './axios';

export const getWallet = async () => {
    const res = await axiosInstance.get('/growth/wallet');
    return res.data;
};

export const getReferralInfo = async () => {
    const res = await axiosInstance.get('/growth/referrals');
    return res.data;
};

export const applyReferralCode = async (code) => {
    const res = await axiosInstance.post('/growth/referrals/apply', { code });
    return res.data;
};

export const addCredits = async (data) => {
    const res = await axiosInstance.post('/growth/wallet/add', data);
    return res.data;
};

export const createWalletTopupOrder = async (amount) => {
    const res = await axiosInstance.post('/growth/wallet/topup/order', { amount });
    return res.data;
};

export const confirmWalletTopup = async (payload) => {
    const res = await axiosInstance.post('/growth/wallet/topup/confirm', payload);
    return res.data;
};

export const validateCoupon = async (data) => {
    const res = await axiosInstance.post('/growth/coupons/validate', data);
    return res.data;
};

// Admin specific growth APIs
export const getCoupons = async () => {
    const res = await axiosInstance.get('/admin/coupons');
    return res.data.coupons;
};

export const createCoupon = async (data) => {
    const res = await axiosInstance.post('/admin/coupons', data);
    return res.data;
};

export const updateCouponStatus = async (id, isActive) => {
    const res = await axiosInstance.patch(`/admin/coupons/${id}/status`, { isActive });
    return res.data;
};

export const deleteCoupon = async (id) => {
    const res = await axiosInstance.delete(`/admin/coupons/${id}`);
    return res.data;
};

// ── FAVORITE WORKERS (Sprint 17 - #80) ──────────────────────────

export const toggleFavoriteWorker = async (workerProfileId) => {
    const res = await axiosInstance.post('/growth/favorites/toggle', { workerProfileId });
    return res.data;
};

export const getFavoriteWorkers = async () => {
    const res = await axiosInstance.get('/growth/favorites');
    return res.data.favorites;
};

export const getFavoriteWorkerIds = async () => {
    const res = await axiosInstance.get('/growth/favorites/ids');
    return res.data.workerProfileIds;
};

export const checkFavoriteWorker = async (workerProfileId) => {
    const res = await axiosInstance.get(`/growth/favorites/check/${workerProfileId}`);
    return res.data.favorited;
};

// ── LOYALTY POINTS (Sprint 17 - #75) ────────────────────────────

export const getLoyaltySummary = async () => {
    const res = await axiosInstance.get('/growth/loyalty');
    return res.data;
};

export const redeemLoyaltyPoints = async (points) => {
    const res = await axiosInstance.post('/growth/loyalty/redeem', { points });
    return res.data;
};

// ── URBANPRO PLUS (Sprint 17 - #74) ────────────────────────────

export const getProPlusSubscription = async () => {
    const res = await axiosInstance.get('/growth/proplus');
    return res.data.subscription;
};

export const subscribeProPlus = async (planId) => {
    const res = await axiosInstance.post('/growth/proplus/subscribe', { planId });
    return res.data.subscription;
};

export const cancelProPlus = async () => {
    const res = await axiosInstance.post('/growth/proplus/cancel');
    return res.data.subscription;
};

// ── GIFT CARDS (Sprint 17 - #76) ─────────────────────────────

export const purchaseGiftCard = async (data) => {
    const res = await axiosInstance.post('/growth/giftcards/purchase', data);
    return res.data;
};

export const redeemGiftCard = async (data) => {
    const res = await axiosInstance.post('/growth/giftcards/redeem', data);
    return res.data;
};

export const checkGiftCard = async (code) => {
    const res = await axiosInstance.get(`/growth/giftcards/check/${code}`);
    return res.data;
};

