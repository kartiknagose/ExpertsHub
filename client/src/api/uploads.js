// Upload API calls
// Handles file uploads (profile photo)

import axiosInstance from './axios';

const UPLOAD_ENDPOINTS = {
  PROFILE_PHOTO: '/uploads/profile-photo',
};

/**
 * Upload profile photo
 * @param {File} file - Image file
 * @returns {Promise} Response with uploaded URL
 */
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axiosInstance.post(UPLOAD_ENDPOINTS.PROFILE_PHOTO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
