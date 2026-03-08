import axiosInstance from './axiosConfig';

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
