"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Phone,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bot,
  Plus,
  UserCheck,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Leads", href: "/lead-dashboard", icon: Users },
  { name: "Lead Management", href: "/leads", icon: Users },
  { 
    name: "Add Lead", 
    icon: Plus,
    submenu: [
      { name: "Single Lead", href: "/single-lead" },
      { name: "Multiple Lead", href: "/multiple-lead" },
    ]
  },
  { name: "Make Call", href: "/make-call", icon: Phone },
  { name: "Assistants", href: "/assistants", icon: Bot },
  { name: "Assign AI", href: "/assign-ai", icon: Zap },
  { name: "Call History", href: "/call-history", icon: History },
  { name: "Site Visit", href: "/site-visits", icon: History },
  { name: "Site Users", href: "/site-user", icon: UserCheck },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Store sidebar state in localStorage for persistence
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    // Update CSS variable for layout margin
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isOpen ? '256px' : '80px'
    );
  }, [isOpen]);

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .sidebar-gradient {
          background: linear-gradient(135deg, #34DB17 0%, #306B25 100%);
        }
        
        .nav-item-active {
          background: linear-gradient(135deg, #34DB17 0%, #306B25 100%);
          box-shadow: 0 4px 12px rgba(52, 219, 23, 0.3);
          color: white;
        }
        
        .nav-item-hover:hover {
          background: linear-gradient(135deg, #34DB17 0%, #306B25 100%);
          transform: translateX(4px);
          color: white;
        }
      `}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className={`h-full ${isOpen ? "w-64" : "w-20"} bg-white text-gray-900 flex flex-col transition-all duration-300 ease-out shadow-lg`}>
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {isOpen && (
              <div className="flex items-center gap-3 transition-all duration-300">
                <img 
                  src="/black-logo.svg" 
                  alt="Aloqa AI" 
                  className="w-52 h-10 transform hover:scale-110 transition-transform duration-300"
                />
                {/* <div>
                  <h1 className="text-xl font-bold text-gray-900">Aloqa AI</h1>
                  <p className="text-xs text-gray-600">AI Calling System</p>
                </div> */}
              </div>
            )}
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto transform hover:scale-110 transition-transform duration-300 shadow-md hover:shadow-lg"
                title="Expand sidebar"
              >
                <img 
                  src="/inner-logo.svg" 
                  alt="Aloqa AI" 
                  className="w-6 h-6"
                />
              </button>
            )}
            {/* Collapse Button - Only visible when sidebar is open */}
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 text-gray-900 hidden lg:flex items-center justify-center"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {/* Mobile close button */}
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scroll-smooth">
            {navigation.map((item, idx) => {
              const Icon = item.icon;
              const isActive = !("submenu" in item) && (pathname === item.href || (pathname === "/" && item.href === "/"));
              const isSubmenuOpen = "submenu" in item && expandedMenu === item.name;
              const isSubmenuItemActive = "submenu" in item && item.submenu?.some(sub => pathname === sub.href);
              
              return (
                <div key={item.name}>
                  {/* Main item */}
                  {"submenu" in item ? (
                    <button
                      onClick={() => {
                        if (isOpen) {
                          setExpandedMenu(isSubmenuOpen ? null : item.name);
                        }
                      }}
                      onMouseEnter={() => !isOpen && setHoveredMenu(item.name)}
                      onMouseLeave={() => !isOpen && setHoveredMenu(null)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out transform group relative ${
                        isSubmenuItemActive
                          ? "nav-item-active font-semibold shadow-md"
                          : "nav-item-hover text-gray-700 hover:text-gray-900"
                      }`}
                      style={{
                        transitionDelay: `${idx * 50}ms`,
                      }}
                      title={!isOpen ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 shrink-0 ${
                        isSubmenuItemActive ? "text-white scale-110" : "text-gray-600 group-hover:text-gray-900 group-hover:scale-110"
                      }`} />
                      {isOpen && (
                        <span className={`font-medium transition-all duration-300 flex-1 text-left ${
                          isSubmenuItemActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                        }`}>
                          {item.name}
                        </span>
                      )}
                      {isOpen && (
                        <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSubmenuOpen ? "rotate-90" : ""}`} />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out transform group ${
                        isActive
                          ? "nav-item-active font-semibold shadow-md"
                          : "nav-item-hover text-gray-700 hover:text-gray-900"
                      }`}
                      style={{
                        transitionDelay: `${idx * 50}ms`,
                      }}
                      title={!isOpen ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 shrink-0 ${
                        isActive ? "text-white scale-110" : "text-gray-600 group-hover:text-gray-900 group-hover:scale-110"
                      }`} />
                      {isOpen && (
                        <span className={`font-medium transition-all duration-300 ${
                          isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                        }`}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  {/* Submenu */}
                  {("submenu" in item && isOpen && isSubmenuOpen && item.submenu) && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                      {item.submenu.map((subitem) => {
                        const isSubActive = pathname === subitem.href;
                        return (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                              isSubActive
                                ? "bg-[#34DB17] text-white font-medium"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {subitem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Submenu Tooltip - When Collapsed */}
                  {("submenu" in item && !isOpen && hoveredMenu === item.name && item.submenu) && (
                    <div className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-48" style={{ left: "92px", top: "50%", transform: "translateY(-50%)" }}>
                      {item.submenu.map((subitem) => {
                        const isSubActive = pathname === subitem.href;
                        return (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 text-sm whitespace-nowrap first:rounded-t-lg last:rounded-b-lg ${
                              isSubActive
                                ? "bg-[#34DB17] text-white font-medium"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {subitem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Toggle Button - REMOVED (moved to logo section) */}

        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-10 p-2 rounded-xl bg-gradient-to-br from-[#34DB17] to-[#306B25] text-white lg:hidden shadow-md transform transition-all duration-300 hover:scale-110 ${
          isOpen ? "hidden" : "block animate-slideIn"
        }`}
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
}
