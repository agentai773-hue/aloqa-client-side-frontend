"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from '@/store/hooks';
import { performLogout } from '@/store/slices/authActions';
import { useState } from "react";
import Cookies from "js-cookie";

export default function LogoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      // Perform logout action (clears state and token)
      await dispatch(performLogout() as any);
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify token is actually removed
      const token = Cookies.get('token');
      if (token) {
        Cookies.remove('token');
      }
      
      // Hard redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error("Logout failed:", error);
      // Force hard redirect even if there's an error
      window.location.href = '/auth/login';
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <LogOut className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          Are you sure you want to
        </h1>
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Log out?
        </h2>

        {/* Buttons */}
        <div className="flex gap-6">
          <button
            onClick={handleCancel}
            disabled={isLoggingOut}
            className="flex-1 px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold text-lg text-gray-900 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleLogoutConfirm}
            disabled={isLoggingOut}
            className="flex-1 px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-lg text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "Logging out..." : "Yes, I want"}
          </button>
        </div>
      </div>
    </div>
  );
}
