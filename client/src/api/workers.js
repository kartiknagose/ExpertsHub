// Workers API calls
// Handles worker profile management and service associations

import axiosInstance from './axios';

// Workers API endpoints
const WORKERS_ENDPOINTS = {
  PROFILE: '/workers/profile',
  ME: '/workers/me',
  ME_SERVICES: '/workers/me/services',
  ADD_SERVICE: '/workers/services',
  WORKER_SERVICES: (workerId) => `/workers/${workerId}/services`,
  DELETE_SERVICE: (serviceId) => `/workers/services/${serviceId}`,
  PUBLIC_PROFILE: (workerId) => `/workers/${workerId}`,
  LEADERBOARD: '/workers/leaderboard/top',
};

/**
 * Get public profile of a worker
 * @param {number} workerId - Worker's profile ID
 * @returns {Promise} Response with worker profile and their services
 */
export const getWorkerPublicProfile = async (workerId) => {
  const response = await axiosInstance.get(WORKERS_ENDPOINTS.PUBLIC_PROFILE(workerId));
  return response.data;
};

/**
 * Create worker profile (first-time setup for workers)
 * @param {Object} data - Worker profile data
 * @param {string} data.bio - Worker's bio/description
 * @param {Array<string>} data.skills - Array of skills
 * @param {number} data.hourlyRate - Hourly rate
 * @returns {Promise} Response with created profile
 */
export const createWorkerProfile = async (data) => {
  const response = await axiosInstance.post(WORKERS_ENDPOINTS.PROFILE, data);
  return response.data;
};

/**
 * Get current worker's profile
 * @returns {Promise} Response with worker profile data
 */
export const getMyWorkerProfile = async () => {
  const response = await axiosInstance.get(WORKERS_ENDPOINTS.ME);
  return response.data;
};

/**
 * Associate a service with current worker
 * @param {Object} data - Service association data
 * @param {string} data.serviceId - ID of service to associate
 * @returns {Promise} Response confirming association
 */
export const addServiceToWorker = async (data) => {
  const response = await axiosInstance.post(WORKERS_ENDPOINTS.ADD_SERVICE, data);
  return response.data;
};

/**
 * Get all services associated with current worker
 * @returns {Promise} Response with array of worker's services
 */
export const getMyServices = async () => {
  const response = await axiosInstance.get(WORKERS_ENDPOINTS.ME_SERVICES);
  return response.data;
};

/**
 * Get all services for a specific worker (by worker ID)
 * @param {string} workerId - Worker's ID
 * @returns {Promise} Response with array of worker's services
 */
export const getWorkerServices = async (workerId) => {
  const response = await axiosInstance.get(WORKERS_ENDPOINTS.WORKER_SERVICES(workerId));
  return response.data;
};

/**
 * Remove service association from current worker
 * @param {string} serviceId - ID of service to remove
 * @returns {Promise} Response confirming removal
 */
export const removeServiceFromWorker = async (serviceId) => {
  const response = await axiosInstance.delete(WORKERS_ENDPOINTS.DELETE_SERVICE(serviceId));
  return response.data;
};

/**
 * Get top workers leaderboard
 * @param {number} limit 
 * @returns {Promise} Response with top workers array
 */
export const getLeaderboard = async (limit = 20) => {
  const response = await axiosInstance.get(WORKERS_ENDPOINTS.LEADERBOARD, { params: { limit } });
  return response.data.workers;
};
