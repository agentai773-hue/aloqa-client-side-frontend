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

        // Save token to localStorage
        // localStorage.setItem('token', token);

        dispatch(setUser({ token, user }));
        dispatch(setLoading(false));
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
      const { token, user } = await verifyToken();
      // Token is already stored in cookies by backend
      // No need to manually set it
      dispatch(setUser({ token, user }));
      return true;
    } catch (err) {
      dispatch(logout());
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    // Remove token from cookies
    Cookies.remove('token');
    dispatch(logout());
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
