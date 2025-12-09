"use client";

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  loginUser, 
  logoutUser, 
  verifyToken, 
  clearError, 
  clearLoginError,
  resetAuth,
  initializeAuth,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectLoginError,
  selectIsInitialized
} from '../store/slices/authSlice';
import type { LoginCredentials } from '../api/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const loginError = useAppSelector(selectLoginError);
  const isInitialized = useAppSelector(selectIsInitialized);

  // Actions
  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await dispatch(loginUser(credentials));
    return result;
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const verify = useCallback(async () => {
    const result = await dispatch(verifyToken());
    return result;
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearLoginErrors = useCallback(() => {
    dispatch(clearLoginError());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const initialize = useCallback(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    loginError,
    isInitialized,
    
    // Actions
    login,
    logout,
    verify,
    initialize,
    clearErrors,
    clearLoginErrors,
    reset,
  };
};

export default useAuth;