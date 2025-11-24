"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FullPageLoader } from "@/components/ui";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsAuthenticated(loggedIn);

      // If not logged in and not on login page, redirect to login
      if (!loggedIn && pathname !== "/auth/login") {
        router.push("/auth/login");
        setIsLoading(false);
      }
      // If logged in and on login page, redirect to dashboard
      else if (loggedIn && pathname === "/auth/login") {
        router.push("/");
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loader during authentication check
  if (isLoading) {
    return <FullPageLoader text="Loading..." />;
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated && pathname !== "/auth/login") {
    return <FullPageLoader text="Redirecting..." />;
  }

  return <>{children}</>;
}
