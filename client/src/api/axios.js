// Axios instance configuration with interceptors for API calls
// Handles authentication tokens, request/response logging, and error handling

import axios from 'axios';
import { API_BASE_URL } from '../config/runtime';
import { clientEnv } from '../config/env';

// Base API URL - points to backend server
const API_URL = API_BASE_URL;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: clientEnv.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests (legacy JWT + CORS)
});

/**
 * Retrieve the current Clerk session token, if Clerk is loaded and a user is
 * signed in. Returns null when Clerk is not configured or the user is signed out.
 */
const getClerkToken = async () => {
  try {
    // window.Clerk is injected by ClerkProvider when the publishable key is set.
    if (typeof window !== 'undefined' && window.Clerk?.session) {
      return await window.Clerk.session.getToken();
    }
  } catch {
    // Ignore — Clerk not loaded or session expired.
  }
  return null;
};

// Request interceptor — attach Clerk Bearer token when available
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getClerkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Legacy fallback: cookie-based auth is handled automatically by withCredentials
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Runs after every response
axiosInstance.interceptors.response.use(
  (response) => {
    // Return response data directly for cleaner API calls
    return response;
  },
  (error) => {
    // Handle response errors globally
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out - backend took too long to respond');
    }

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - token expired or invalid
      if (status === 401) {
        // Only redirect if there was a prior user session
        const hadUser = localStorage.getItem('user');

        // Clear auth data
        localStorage.removeItem('user');

        // Only redirect to login if not on public routes
        const publicPaths = [
          '/', '/login', '/register', '/forgot-password', '/reset-password',
          '/verify-email', '/services', '/system-status', '/about', '/contact',
          '/how-it-works', '/pricing', '/security', '/faq', '/privacy',
          '/terms', '/cookies', '/blog', '/careers',
        ];
        const isPublicPath = publicPaths.some((path) =>
          window.location.pathname === '/' ? path === '/' : window.location.pathname.startsWith(path)
        );

        if (hadUser && !isPublicPath) {
          // Dispatch a custom event so AuthContext can handle navigation
          // via React Router instead of a full page reload.
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }

      // Handle 403 Forbidden - insufficient permissions
      if (status === 403) {
        console.error('Access denied:', data.message);
      }

      // Handle 404 Not Found
      if (status === 404) {
        console.error('Resource not found:', data.message);
      }

      // Handle 500 Server Error
      if (status === 500) {
        console.error('Server error:', data.message);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network error - server not responding');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
