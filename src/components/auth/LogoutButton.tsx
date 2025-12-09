"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  variant?: 'button' | 'link' | 'icon';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '',
  showText = true,
  variant = 'button'
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by the auth system
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 ${className}`}
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    );
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            Logging out...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogOut size={16} />
            {showText && 'Logout'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {showText && 'Logging out...'}
        </>
      ) : (
        <>
          <LogOut size={16} />
          {showText && 'Logout'}
        </>
      )}
    </button>
  );
};

export default LogoutButton;