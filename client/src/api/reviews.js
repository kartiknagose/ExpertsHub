import axiosInstance from './axios';

const REVIEW_ENDPOINTS = {
  BASE: '/reviews',
  WRITTEN: '/reviews/written',
  RECEIVED: '/reviews/received',
  PENDING: '/reviews/pending',
  // Legacy
  CUSTOMER: '/reviews/customer',
  WORKER: '/reviews/worker',
};

/** Create a review (both roles) */
export const createReview = async (data) => {
  const response = await axiosInstance.post(REVIEW_ENDPOINTS.BASE, data);
  return response.data;
};

/** Get reviews I've written */
export const getMyReviews = async () => {
  const response = await axiosInstance.get(REVIEW_ENDPOINTS.WRITTEN);
  return response.data;
};

/** Get reviews about me */
export const getReviewsAboutMe = async () => {
  const response = await axiosInstance.get(REVIEW_ENDPOINTS.RECEIVED);
  return response.data;
};

/** Get bookings pending my review */
export const getPendingReviews = async () => {
  const response = await axiosInstance.get(REVIEW_ENDPOINTS.PENDING);
  return response.data;
};

// Legacy exports for backward compatibility
export const getCustomerReviews = getMyReviews;
export const getWorkerReviews = getReviewsAboutMe;
