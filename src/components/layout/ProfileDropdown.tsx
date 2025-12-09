import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ProfileDropdownProps {
  isCollapsed: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfile = () => {
    setIsOpen(false);
    router.push('/dashboard/profile');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center w-full transition-all duration-200 ${
          isCollapsed 
            ? 'px-2 py-3  justify-center' 
            : 'px-3 py-3  justify-between'
        } text-sm font-medium rounded-xl text-gray-700 hover:bg-green-50 hover:text-[#5DD149]`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-[#5DD149] text-white">
            <div className="h-8 w-8 rounded-full  flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.firstName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                className="font-medium text-sm whitespace-nowrap ml-3"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Profile
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {/* Chevron Icon */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Profile
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px] ${
              isCollapsed 
                ? 'left-full bottom-0 ml-2' 
                : 'right-0 bottom-full mb-2'
            }`}
            style={{ zIndex: 9999 }}
          >
            {/* User Info */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.firstName || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleProfile}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4 mr-3" />
                Profile Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};