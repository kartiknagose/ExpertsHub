import axiosInstance from './axios';

const PAYMENT_ENDPOINTS = {
  ME: '/payments/me',
  ADMIN: '/payments/admin',
};

export const getMyPayments = async () => {
  const response = await axiosInstance.get(PAYMENT_ENDPOINTS.ME);
  return response.data;
};

export const getAllPayments = async () => {
  const response = await axiosInstance.get(PAYMENT_ENDPOINTS.ADMIN);
  return response.data;
};
