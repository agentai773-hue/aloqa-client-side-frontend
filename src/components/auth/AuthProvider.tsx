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
  const { isAuthenticated, isLoading, verify } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const isLoginPage = pathname === "/auth/login";
  const isLogoutPage = pathname === "/logout";
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
    
    // Don't redirect on logout page - let it handle its own redirect
    if (isLogoutPage) {
      return;
    }

    if (isAuthenticated && isLoginPage) {
      router.push("/");
    } else if (!isAuthenticated && !isLoginPage && !isForgotPasswordPage) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, pathname, router, isInitializing, isLoginPage, isLogoutPage, isForgotPasswordPage]);

  if (isInitializing || isLoading) {
    return <FullPageLoader text="Initializing..." />;
  }

  if (!isAuthenticated && !isLoginPage && !isForgotPasswordPage && !isLogoutPage) {
    return <FullPageLoader text="Redirecting to login..." />;
  }

  return <>{children}</>;
}
