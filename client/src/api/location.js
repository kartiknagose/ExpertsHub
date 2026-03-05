import axiosInstance from './axios';

/**
 * Update worker real-time location
 * @param {Object} data - { latitude, longitude, isOnline }
 */
export const updateWorkerLocation = async (data) => {
    const response = await axiosInstance.post('/location/update', data);
    return response.data;
};

/**
 * Get location of a specific worker
 * @param {number} workerProfileId 
 */
export const getWorkerLocation = async (workerProfileId) => {
    const response = await axiosInstance.get(`/location/worker/${workerProfileId}`);
    return response.data;
};


