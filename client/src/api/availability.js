import axiosInstance from './axios';

const AVAILABILITY_ENDPOINTS = {
  ME: '/availability/me',
  BASE: '/availability',
  BY_ID: (id) => `/availability/${id}`,
};

export const getMyAvailability = async () => {
  const response = await axiosInstance.get(AVAILABILITY_ENDPOINTS.ME);
  return response.data;
};

export const createAvailability = async (data) => {
  const response = await axiosInstance.post(AVAILABILITY_ENDPOINTS.BASE, data);
  return response.data;
};

export const deleteAvailability = async (availabilityId) => {
  const response = await axiosInstance.delete(AVAILABILITY_ENDPOINTS.BY_ID(availabilityId));
  return response.data;
};
