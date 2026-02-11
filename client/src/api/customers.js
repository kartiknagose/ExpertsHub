// Customer API calls
// Handles customer profile setup and retrieval

import axiosInstance from './axios';

const CUSTOMER_ENDPOINTS = {
  PROFILE: '/customers/profile',
};

/**
 * Create or update customer profile (address + optional profile photo)
 * @param {Object} data - Profile data
 * @returns {Promise} Response with address
 */
export const saveCustomerProfile = async (data) => {
  const response = await axiosInstance.post(CUSTOMER_ENDPOINTS.PROFILE, data);
  return response.data;
};

/**
 * Get current customer profile
 * @returns {Promise} Response with user + addresses
 */
export const getCustomerProfile = async () => {
  const response = await axiosInstance.get(CUSTOMER_ENDPOINTS.PROFILE);
  return response.data;
};
