'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { navigationSections } from '../../config/navigationSections';
import { InternetProvider, useInternetContext } from '../providers/InternetProvider';
import { SidebarSection } from './SidebarSection';
import { ProfileDropdown } from './ProfileDropdown';
import { HeaderProfileDropdown } from './HeaderProfileDropdown';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOnline } = useInternetContext();
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        return false;
      }
      const saved = localStorage.getItem('sidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Optimized window resize handler with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoized page header to prevent unnecessary recalculations
  const pageHeader = useMemo(() => {
    const path = pathname;
    


    switch (path) {
      case '/dashboard':
        return { 
          title: 'Dashboard', 
          subtitle: 'Welcome back! Here\'s what\'s happening.',
        
        };
      case '/dashboard/calls':
        return { 
          title: 'Call History', 
          subtitle: 'View and manage your calling history',
        };
      case '/dashboard/profile':
        return { 
          title: 'Profile', 
          subtitle: 'Manage your account settings and preferences',
        };
      case '/dashboard/settings':
        return { 
          title: 'Settings', 
          subtitle: 'Manage your account preferences and security settings',
          breadcrumb: 'Settings'
        };
      case '/dashboard/projects':
        return { 
          title: 'Projects', 
          subtitle: 'Manage and monitor your projects',
        };
      case '/dashboard/leads':
        return { 
          title: 'Lead Management', 
          subtitle: 'Track and manage your sales leads',
        };
      case '/dashboard/leads/add':
        return { 
          title: 'Add New Lead', 
          subtitle: 'Create a new lead record in the system',
        };
      default:
        return { 
          title:'Dashboard', 
          subtitle: `Working on Dashboard`,
        };
    }
  }, [pathname]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    }
  };

  // Memoized sidebar width calculation
  const sidebarWidth = useMemo(() => {
    if (windowWidth >= 1280) {
      return isSidebarOpen ? 280 : 88;
    } else if (windowWidth >= 1024) {
      return isSidebarOpen ? 256 : 80;
    } else if (windowWidth >= 768) {
      return isSidebarOpen ? 240 : 72;
    } else if (windowWidth >= 640) {
      return isSidebarOpen ? 220 : 64;
    } else {
      return isSidebarOpen ? 200 : 0;
    }
  }, [windowWidth, isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">{/* Optimized Sidebar */}
      {/* Optimized Sidebar */}
      <motion.aside 
        className="fixed top-0 left-0 z-50 h-screen bg-white shadow-lg border-r border-gray-200 lg:z-30 lg:translate-x-0"
        initial={false}
        animate={{ 
          width: sidebarWidth,
          x: windowWidth >= 1024 ? 0 : (isSidebarOpen ? 0 : -sidebarWidth)
        }}
        transition={{ 
          type: "tween",
          duration: 0.3,
          ease: "easeInOut"
        }}
        style={{
          visibility: windowWidth < 1024 && !isSidebarOpen ? 'hidden' : 'visible',
          overflow: 'hidden'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Simplified Header */}
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 px-3 lg:px-4 border-b border-gray-200 bg-white shrink-0">
            {/* Logo */}
            {isSidebarOpen ? (
              <Image 
                src="/black-logo.svg" 
                alt="Aloqa AI" 
                width={120}
                height={48}
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                priority
              />
            ) : (
              windowWidth >= 1024 && (
                <Image 
                  src="/inner-logo.svg" 
                  alt="Logo" 
                  width={40}
                  height={40}
                  className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 object-contain mx-auto cursor-pointer hover:scale-110 transition-transform"
                  onClick={toggleSidebar}
                  priority
                />
              )
            )}
            
            {/* Toggle Button */}
            {isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                title="Collapse Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col px-2 py-3 overflow-y-auto">
            <div className="space-y-1 flex-1">
              {navigationSections.map((section) => {
                // Improved active state calculation - only highlight parent if no child matches exactly
                let isActive = false;
                let hasActiveChild = false;
                
                if (section.children) {
                  hasActiveChild = section.children.some((child) => pathname === child.href);
                  // Only mark parent as active if we're on the parent route and no child is active
                  isActive = !hasActiveChild && pathname === section.href;
                } else {
                  isActive = pathname === section.href;
                }

                return (
                  <SidebarSection
                    key={section.id}
                    section={section}
                    isCollapsed={!isSidebarOpen}
                    isActive={isActive}
                    onMobileClick={() => {
                      if (windowWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Profile Dropdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 shrink-0">
              <ProfileDropdown isCollapsed={!isSidebarOpen} />
            </div>
          </nav>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && windowWidth < 1024 && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden bg-gray-600/75 backdrop-blur-sm"
            onClick={toggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: windowWidth >= 1024 ? `${sidebarWidth}px` : '0'
        }}
      >
        {/* Optimized Header */}
        <header 
          className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 z-40 h-16 sm:h-18 lg:h-20 transition-all duration-300 ease-in-out"
          style={{
            left: windowWidth >= 1024 ? `${sidebarWidth}px` : '0'
          }}
        >
          <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6 xl:px-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title with Breadcrumb */}
            <div className="flex-1 lg:flex-none">
              {/* Breadcrumb */}
            
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {pageHeader.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 lg:mt-1">
                {pageHeader.subtitle}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Connection Status */}
              <div 
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="hidden sm:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-1.5 sm:p-2 text-gray-400 hover:text-[#5DD149] hover:bg-green-50 rounded-lg transition-colors">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <HeaderProfileDropdown />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 min-w-0 overflow-auto pt-16 sm:pt-18 lg:pt-20">
          <div className="bg-white min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-200px)] rounded-lg lg:rounded-xl m-3 sm:m-4 lg:m-6 xl:m-8 overflow-hidden">
            <div className="p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto overflow-x-hidden h-full">
              {children}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <InternetProvider>
      <LayoutContent>{children}</LayoutContent>
    </InternetProvider>
  );
}