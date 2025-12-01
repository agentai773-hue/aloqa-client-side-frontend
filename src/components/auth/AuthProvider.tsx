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
        // Check localStorage first (most reliable for app startup)
        let hasToken = false;
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            hasToken = true;
            console.log('🔐 Token found in localStorage, verifying with backend...');
          }
        }
        
        // Also check cookies (httpOnly from backend)
        if (!hasToken) {
          const cookieToken = Cookies.get('token');
          if (cookieToken) {
            hasToken = true;
            console.log('🔐 Token found in cookies, verifying with backend...');
          }
        }
        
        if (hasToken) {
          // Token exists, verify it with backend using Authorization header
          const verified = await verify();
          
          if (verified) {
            console.log('✅ Token verified successfully');
          } else {
            console.warn('⚠️ Token verification failed');
          }
        } else {
          console.log('ℹ️ No token found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clean up on error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        Cookies.remove('token');
      } finally {
        // Small delay to ensure Redux state is updated
        setTimeout(() => {
          setIsInitializing(false);
        }, 100);
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
