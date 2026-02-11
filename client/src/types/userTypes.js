/**
 * User Type Definitions
 * 
 * These JSDoc types define the shape of user-related data
 * Used across the entire app for consistency
 */

/**
 * @typedef {Object} User
 * @property {number} id - Unique user ID
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {('ADMIN'|'WORKER'|'CUSTOMER')} role - User role
 * @property {Date} createdAt - Account creation date
 */

/**
 * @typedef {Object} WorkerProfile
 * @property {number} id - Profile ID
 * @property {number} userId - Reference to User.id
 * @property {string} bio - Worker bio/description
 * @property {number} hourlyRate - Hourly rate in currency
 * @property {string[]} skills - Array of skills
 * @property {string[]} serviceAreas - Geographic areas served
 * @property {boolean} isVerified - Verification status
 * @property {Date} createdAt - Profile creation date
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} password - Password (min 8 chars)
 */

export {};
