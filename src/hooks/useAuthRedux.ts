import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { RootState, AppDispatch } from '@/store/store';
import { setUser, setLoading, setError, logout, clearError } from '@/store/slices/authSlice';
import { loginUser, verifyToken } from '@/api/auth-api';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const { token, user } = await loginUser({ email, password });

        // Check if user is approved
        if (user.isApproval !== 1) {
          dispatch(setError('Your account has not been approved by admin. Please contact support.'));
          dispatch(setLoading(false));
          return false;
        }

        // Ensure token is stored in localStorage for persistence
        if (token) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
        }

        dispatch(setUser({ token, user }));
        dispatch(setLoading(false));
        console.log('✅ Login successful');
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Login failed';
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        return false;
      }
    },
    [dispatch]
  );

  const verify = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const { token, user } = await verifyToken();
      
      // Check if user is approved
      if (user.isApproval !== 1) {
        dispatch(setError('Your account has not been approved by admin.'));
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        dispatch(logout());
        return false;
      }
      
      // Ensure token is set in localStorage
      if (token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      }
      
      dispatch(setUser({ token, user }));
      console.log('✅ Verification successful');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed';
      dispatch(setError(errorMessage));
      
      // Clear token from all storage locations
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      dispatch(logout());
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    // Remove token from all storage locations
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    Cookies.remove('token');
    dispatch(logout());
    console.log('✅ Logout successful');
  }, [dispatch]);

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    verify,
    logout: logoutUser,
    clearError: () => dispatch(clearError()),
  };
}
