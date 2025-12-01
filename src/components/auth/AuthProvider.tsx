"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuthRedux";
import { FullPageLoader } from "@/components/ui";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, verify, token } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const isLoginPage = pathname === "/auth/login";
  const isForgotPasswordPage = pathname?.startsWith("/auth/forgot-password");
  const initRef = useRef(false);

  // Initialize auth from token on app startup (only once)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initAuth() {
      try {
        // Check for token in cookies (backend stores token in cookies)
        const token = Cookies.get('token');
        if (token) {
          // Token exists, verify it's still valid
          const verified = await verify();
          if (!verified) {
            console.warn('Token verification failed, user will be redirected to login');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitializing(false);
      }
    }
    
    initAuth();
  }, [verify]);

  // Handle redirects after auth is initialized
  useEffect(() => {
    if (isInitializing) return;
    
    // If authenticated and on login page, redirect to dashboard immediately
    if (isAuthenticated && isLoginPage) {
      console.log('Authenticated user on login page, redirecting to dashboard');
      router.replace("/");
      return;
    }
    
    // If not authenticated and not on login/forgot-password page, redirect to login
    if (!isAuthenticated && !isLoginPage && !isForgotPasswordPage) {
      console.log('Not authenticated, redirecting to login');
      router.replace("/auth/login");
    }
  }, [isAuthenticated, pathname, router, isInitializing, isLoginPage, isForgotPasswordPage]);

  // Only show loader during initial app load (not during login/logout transitions)
  if (isInitializing && !isLoginPage && !isForgotPasswordPage) {
    return <FullPageLoader text="Initializing..." />;
  }

  // Show content, let redirects happen in background
  return <>{children}</>;
}
