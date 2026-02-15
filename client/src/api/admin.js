import axiosInstance from './axios';

const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  WORKERS: '/admin/workers',
  USER_STATUS: (id) => `/admin/users/${id}/status`,
  USER_DELETE: (id) => `/admin/users/${id}`,
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

export const updateUserStatus = async (id, isActive) => {
  const response = await axiosInstance.patch(ADMIN_ENDPOINTS.USER_STATUS(id), { isActive });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(ADMIN_ENDPOINTS.USER_DELETE(id));
  return response.data;
};
