'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AloqaFullScreenLoader } from '@/components/loaders/AloqaLoader';

interface AppLoadingContextType {
  isInitialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
  showPageLoader: boolean;
  setShowPageLoader: (loading: boolean) => void;
}

const AppLoadingContext = createContext<AppLoadingContextType | undefined>(undefined);

export const useAppLoading = () => {
  const context = useContext(AppLoadingContext);
  if (!context) {
    throw new Error('useAppLoading must be used within AppLoadingProvider');
  }
  return context;
};

interface AppLoadingProviderProps {
  children: React.ReactNode;
}

export const AppLoadingProvider: React.FC<AppLoadingProviderProps> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showPageLoader, setShowPageLoader] = useState(false);

  useEffect(() => {
    // Hide initial loading after auth is complete and minimum display time
    const minDisplayTime = 3000; // Show beautiful loader for 3 seconds to see the design
    
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, minDisplayTime);

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide initial loading when auth is ready (called by AuthProvider)
  const setInitialLoading = (loading: boolean) => {
    if (!loading) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsInitialLoading(loading);
      }, 300);
    } else {
      setIsInitialLoading(loading);
    }
  };

  return (
    <AppLoadingContext.Provider value={{
      isInitialLoading,
      setInitialLoading,
      showPageLoader,
      setShowPageLoader
    }}>
      {/* Show initial app loader */}
      {isInitialLoading && (
        <AloqaFullScreenLoader 
          text="Welcome to Aloqa AI..."
        />
      )}
      
      {/* Show page loader when needed */}
      {showPageLoader && (
        <AloqaFullScreenLoader 
          text="Loading..."
        />
      )}
      
      {/* App content */}
      {!isInitialLoading && children}
    </AppLoadingContext.Provider>
  );
};