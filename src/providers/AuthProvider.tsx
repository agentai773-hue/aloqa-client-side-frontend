"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/config/api';

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Context (optional, can be used for additional auth-related context)
const AuthContext = createContext<Record<string, never>>({});

// Internal component that handles auth initialization
const AuthInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { verify, initialize, isInitialized, isAuthenticated } = useAuth();

  useEffect(() => {
    // Verify token on app startup
    const initializeAuth = async () => {
      try {
        if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
          console.log('🔐 Initializing authentication...');
        }
        
        // Check if we have a token in localStorage
        const token = typeof window !== 'undefined' ? 
          localStorage.getItem(APP_CONFIG.AUTH.TOKEN_STORAGE_KEY) : null;
        
        if (token) {
          if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
            console.log('🔑 Found stored token, verifying...');
          }
          await verify();
        } else {
          if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
            console.log('🔑 No stored token found - marking as initialized');
          }
          // No token found, just mark as initialized (user is not authenticated)
          initialize();
        }
      } catch (error) {
        if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
          console.error('❌ Auth initialization failed:', error);
        }
        // Even if there's an error, mark as initialized
        initialize();
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [verify, initialize, isInitialized]);

  // Log auth state changes in development
  useEffect(() => {
    if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS && isInitialized) {
      console.log('🔐 Auth state updated:', { isAuthenticated, isInitialized });
    }
  }, [isAuthenticated, isInitialized]);

  return <>{children}</>;
};

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Provider store={store}>
      <AuthContext.Provider value={{}}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </AuthContext.Provider>
    </Provider>
  );
}

// Optional: if you need to use AuthContext elsewhere
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};