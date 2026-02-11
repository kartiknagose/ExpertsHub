/**
 * Service Type Definitions
 * 
 * Defines the shape of service-related data
 * Matches backend Service and WorkerService models (from Prisma schema)
 */

/**
 * @typedef {Object} Service
 * @property {number} id - Unique service ID
 * @property {string} name - Service name (e.g., "Plumbing", "Electrical Work")
 * @property {string|null} description - Detailed description of the service
 * @property {string|null} category - Service category (e.g., "Home Maintenance")
 * @property {number|null} basePrice - Base price for this service
 * @property {Object|null} translations - Multilingual translations (JSON)
 * @property {Date} createdAt - When service was created
 * @property {Date} updatedAt - Last update time
 */

/**
 * @typedef {Object} WorkerService
 * @property {number} workerId - Worker profile ID (references WorkerProfile.id)
 * @property {number} serviceId - Service ID (references Service.id)
 * 
 * Note: This is just an association table with composite primary key
 * No additional fields like price or availability
 */

export {};
