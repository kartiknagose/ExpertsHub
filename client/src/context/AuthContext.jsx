import { useReducer, useCallback, useEffect, useMemo } from 'react';
import useSocket from '../hooks/useSocket';
import { login as apiLogin, registerCustomer, registerWorker, logout as apiLogout, getCurrentUser, syncUser } from '../api';
import { resolveProfilePhotoUrl } from '../utils/profilePhoto';
import { AuthContext } from './AuthContextBase';
import { isClerkEnabled } from '../config/env';

/**
 * Auth Context
 *
 * Global authentication state management.
 * Provides: user info, loading state, auth actions.
 *
 * When Clerk is configured (VITE_CLERK_PUBLISHABLE_KEY is set) this context
 * expects to be wrapped by ClerkProvider (done in main.jsx). Session
 * hydration is driven by the ClerkBridge component (see below).
 *
 * When Clerk is NOT configured the legacy HTTP-only JWT cookie path is used.
 */

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.LOGIN_SUCCESS:
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case ACTIONS.LOGIN_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: action.payload !== null };
    case ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

const getApiErrorMessage = (error, fallback) => {
  if (error?.code === 'ECONNABORTED') {
    return 'Server is waking up or slow. Please try again in a few seconds.';
  }
  if (error?.request && !error?.response) {
    return 'Unable to reach server. Check your network and try again.';
  }
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    fallback
  );
};

/**
 * AuthProvider Component
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Legacy cookie-based session hydration ─────────────────────────────────
  // Used when Clerk is NOT configured, OR as a fallback for legacy sessions.
  useEffect(() => {
    if (isClerkEnabled) {
      // Clerk-driven hydration is handled externally by ClerkBridge (main.jsx).
      // We still need to stop the initial loading spinner if Clerk takes over.
      return;
    }

    const checkExistingSession = async () => {
      try {
        const data = await getCurrentUser();

        const storedUserRaw = localStorage.getItem('user');
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
        const sessionUser = data.user || null;
        const user = storedUser?.id === sessionUser?.id
          ? { ...storedUser, ...sessionUser }
          : sessionUser;

        if (user?.profilePhotoUrl) {
          user.profilePhotoUrl = resolveProfilePhotoUrl(user.profilePhotoUrl);
        }

        if (user) localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: user });
      } catch {
        localStorage.removeItem('user');
        dispatch({ type: ACTIONS.LOGOUT });
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkExistingSession();
  }, []);

  // Public methods for ClerkBridge (and legacy code) to drive auth state ──

  const hydrateFromClerk = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await getCurrentUser();
      let user = data.user || null;
      if (user?.profilePhotoUrl) {
        user.profilePhotoUrl = resolveProfilePhotoUrl(user.profilePhotoUrl);
      }
      if (user) localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: user });
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 'ONBOARDING_REQUIRED') {
        // Clerk user exists but hasn't completed onboarding — not an error
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return;
      }
      localStorage.removeItem('user');
      dispatch({ type: ACTIONS.LOGOUT });
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('user');
    dispatch({ type: ACTIONS.LOGOUT });
  }, []);

  const setUser = useCallback((user) => {
    dispatch({ type: ACTIONS.SET_USER, payload: user });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!isClerkEnabled) {
        await apiLogout();
      }
      // When Clerk is enabled, ClerkBridge signs the user out of Clerk and
      // then calls clearSession(); don't duplicate the API call here.
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('user');
      dispatch({ type: ACTIONS.LOGOUT });
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const data = await apiLogin(credentials);

      let resolvedUser = data.user || null;
      try {
        const session = await getCurrentUser();
        resolvedUser = session.user || resolvedUser;
      } catch {
        // Keep login response if session check fails
      }

      if (resolvedUser?.profilePhotoUrl) {
        resolvedUser.profilePhotoUrl = resolveProfilePhotoUrl(resolvedUser.profilePhotoUrl);
      }

      if (resolvedUser) localStorage.setItem('user', JSON.stringify(resolvedUser));
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: resolvedUser });

      return { success: true };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Login failed');
      localStorage.removeItem('user');
      dispatch({ type: ACTIONS.LOGOUT });
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      await registerCustomer(data);
      return { success: true };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Registration failed');
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const registerAsWorker = useCallback(async (data) => {
    try {
      await registerWorker(data);
      return { success: true };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Worker registration failed');
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * syncClerkUser — called from OnboardingPage after Clerk sign-up.
   * Creates the DB user profile with name, email, mobile, and role.
   */
  const syncClerkUser = useCallback(async (profileData) => {
    try {
      const data = await syncUser(profileData);
      const user = data.user || null;
      if (user?.profilePhotoUrl) {
        user.profilePhotoUrl = resolveProfilePhotoUrl(user.profilePhotoUrl);
      }
      if (user) localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Profile setup failed');
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const value = useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    registerAsWorker,
    syncClerkUser,
    setUser,
    logout,
    clearError,
    isClerkEnabled,
    // Internal — used by ClerkBridge
    _hydrateFromClerk: hydrateFromClerk,
    _clearSession: clearSession,
  }), [
    state.user, state.isAuthenticated, state.isLoading, state.error,
    login, register, registerAsWorker, syncClerkUser, setUser, logout, clearError,
    hydrateFromClerk, clearSession,
  ]);

  useSocket(state.user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

