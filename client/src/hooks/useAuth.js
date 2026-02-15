import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextBase';

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context
 * Prevents errors by throwing if used outside AuthProvider
 * 
 * Usage:
 * const { user, isAuthenticated, logout } = useAuth();
 * 
 * @returns {{
 *   user: import('../types/userTypes').User|null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   error: string|null,
 *   setUser: Function,
 *   logout: Function,
 *   clearError: Function,
 * }} Auth context value
 * 
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  // Safety check: throw error if hook is used incorrectly
  if (!context) {
    throw new Error(
      'useAuth must be used within <AuthProvider>. ' +
      'Make sure your component is wrapped with AuthProvider in main.jsx'
    );
  }

  return context;
}

/**
 * useAuthStatus Hook
 * 
 * Simpler version of useAuth
 * Only returns loading and authenticated status
 * Useful for components that only need to know "is user logged in?"
 * 
 * Usage:
 * const { isLoading, isAuthenticated } = useAuthStatus();
 * 
 * @returns {{
 *   isLoading: boolean,
 *   isAuthenticated: boolean,
 * }} Auth status only
 */
export function useAuthStatus() {
  const { isLoading, isAuthenticated } = useAuth();

  return {
    isLoading,
    isAuthenticated,
  };
}
