import axiosInstance from './axios';

const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  WORKERS: '/admin/workers',
};

export const getAdminDashboard = async () => {
  const response = await axiosInstance.get(ADMIN_ENDPOINTS.DASHBOARD);
  return response.data;
};

export const getAdminUsers = async (role) => {
  const params = role ? { role } : undefined;
  const response = await axiosInstance.get(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
};

export const getAdminWorkers = async () => {
  const response = await axiosInstance.get(ADMIN_ENDPOINTS.WORKERS);
  return response.data;
};
