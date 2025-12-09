"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AloqaLoader } from '@/components/loaders';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <AloqaLoader text="Authenticating..." size="md" showLogo={true} />
    </div>
  ),
  redirectTo = '/auth/login' 
}) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is initialized and user is not authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isInitialized, isLoading, router, redirectTo]);

  // Show loading while auth is initializing or during authentication check
  if (!isInitialized || isLoading) {
    return <>{fallback}</>;
  }

  // If not authenticated and auth is initialized, don't render children
  // (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;