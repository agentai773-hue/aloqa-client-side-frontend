'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface InternetContextType {
  isOnline: boolean;
}

const InternetContext = createContext<InternetContextType>({
  isOnline: true,
});

export const useInternetContext = () => {
  return useContext(InternetContext);
};

interface InternetProviderProps {
  children: React.ReactNode;
}

export function InternetProvider({ children }: InternetProviderProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <InternetContext.Provider value={{ isOnline }}>
      {children}
    </InternetContext.Provider>
  );
}