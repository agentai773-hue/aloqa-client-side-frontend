import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavSection } from '../../config/navigationSections';

interface SidebarSectionProps {
  section: NavSection;
  isCollapsed: boolean;
  isActive: boolean;
  onMobileClick?: () => void;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  section,
  isCollapsed,
  isActive,
  onMobileClick
}) => {
  const [isExpanded, setIsExpanded] = useState(section.isExpanded || false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleExpanded = () => {
    if (section.isExpandable && !isCollapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleItemClick = (href?: string) => {
    if (href) {
      router.push(href);
      onMobileClick?.();
    }
  };

  const isCurrentPath = (href: string) => {
    // Exact match for most paths, but allow sub-routes for main sections
    if (href === '/dashboard/leads') {
      return pathname === '/dashboard/leads' || (pathname.startsWith('/dashboard/leads/') && pathname !== '/dashboard/leads/add');
    }
    if (href === '/dashboard/leads/add') {
      return pathname === '/dashboard/leads/add';
    }
    return pathname === href;
  };

  return (
    <div className="mb-1">
      {/* Main Section */}
      <div
        onClick={() => {
          if (section.href) {
            handleItemClick(section.href);
          } else {
            toggleExpanded();
          }
        }}
        className={`
          flex items-center justify-between w-full p-3 rounded-lg cursor-pointer transition-all duration-200 group
          ${isActive || (section.href && isCurrentPath(section.href))
            ? 'bg-[#5DD149] text-white shadow-lg' 
            : 'text-gray-700 hover:bg-green-50 hover:text-[#5DD149]'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <div className={`
            transition-colors duration-200
            ${isActive || (section.href && isCurrentPath(section.href))
              ? 'text-white' 
              : 'text-gray-600 group-hover:text-[#5DD149]'
            }
          `}>
            {section.icon}
          </div>
          {!isCollapsed && (
            <span className="font-medium text-sm">{section.name}</span>
          )}
        </div>

        {!isCollapsed && section.isExpandable && (
          <div className={`
            transform transition-transform duration-200
            ${isExpanded ? 'rotate-180' : ''}
          `}>
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {section.isExpandable && section.children && isExpanded && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-2 space-y-1"
          >
            {section.children.map((child, index) => (
              <div
                key={index}
                onClick={() => handleItemClick(child.href)}
                className={`
                  flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-all duration-150
                  ${isCurrentPath(child.href)
                    ? 'bg-[#5DD149] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-green-50 hover:text-[#5DD149]'
                  }
                `}
              >
                <div className={`
                  transition-colors duration-150
                  ${isCurrentPath(child.href)
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-[#5DD149]'
                  }
                `}>
                  {child.icon}
                </div>
                <span className="text-sm font-medium">{child.name}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
