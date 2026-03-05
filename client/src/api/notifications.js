// Notifications API calls
// Handles fetching, reading, and bulk-read of user notifications

import axiosInstance from './axios';

// Notification API endpoints
const NOTIFICATION_ENDPOINTS = {
  BASE: '/notifications',
  READ: (id) => `/notifications/${id}/read`,
  READ_ALL: '/notifications/read-all',
};

/**
 * Get notifications for current user (paginated)
 * @param {Object} [params] - Optional pagination params { page, limit }
 * @returns {Promise<{ notifications, unreadCount, pagination }>}
 */
export const getNotifications = async (params) => {
  const response = await axiosInstance.get(NOTIFICATION_ENDPOINTS.BASE, { params });
  return response.data;
};

/**
 * Mark a single notification as read
 * @param {number} id - Notification ID
 * @returns {Promise<{ success: boolean }>}
 */
export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.patch(NOTIFICATION_ENDPOINTS.READ(id));
  return response.data;
};

/**
 * Mark all notifications as read for current user
 * @returns {Promise<{ success: boolean }>}
 */
export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.post(NOTIFICATION_ENDPOINTS.READ_ALL);
  return response.data;
};
