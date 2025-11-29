"use client";

import { Search, Bell, User, Phone } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between px-6 py-5">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Aloqa AI</h1>
            <p className="text-xs text-gray-500">Client Calling Portal</p>
          </div>
        </div>

        {/* Search */}
        {/* <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div> */}

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Agent
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fadeIn">
                {/* Profile options can be added here later */}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
