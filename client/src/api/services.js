// Services API calls
// Handles service listing, details, and admin service creation

import axiosInstance from './axios';

// Services API endpoints
const SERVICES_ENDPOINTS = {
  BASE: '/services',
  BY_ID: (id) => `/services/${id}`,
  WORKERS: (id) => `/services/${id}/workers`,
};

/**
 * Get all services with optional filters
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.search - Search by name or description
 * @returns {Promise} Response with array of services
 */
export const getAllServices = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add filters to query params if provided
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  
  const queryString = params.toString();
  const url = queryString ? `${SERVICES_ENDPOINTS.BASE}?${queryString}` : SERVICES_ENDPOINTS.BASE;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * Get single service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise} Response with service details
 */
export const getServiceById = async (serviceId) => {
  const response = await axiosInstance.get(SERVICES_ENDPOINTS.BY_ID(serviceId));
  return response.data;
};

/**
 * Create a service (admin only)
 * @param {Object} data - Service data
 * @returns {Promise} Response with created service
 */
export const createService = async (data) => {
  const response = await axiosInstance.post(SERVICES_ENDPOINTS.BASE, data);
  return response.data;
};

/**
 * Get workers who offer a service
 * @param {string|number} serviceId - Service ID
 * @returns {Promise} Response with worker profiles
 */
export const getServiceWorkers = async (serviceId) => {
  const response = await axiosInstance.get(SERVICES_ENDPOINTS.WORKERS(serviceId));
  return response.data;
};

