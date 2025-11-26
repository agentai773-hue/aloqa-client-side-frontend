"use client";

import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  CheckCircle2,
  Users,
  
  Calendar
} from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected">("idle");

  const startCall = () => {
    setCallStatus("calling");
    setTimeout(() => setCallStatus("connected"), 2000);
  };

  const endCall = () => {
    setCallStatus("idle");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900">Client Calling Dashboard</h1>
        <p className="text-gray-600 mt-2">Real Estate Client Management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all animate-slideInLeft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Calls Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
            <span>↑ 12%</span>
            <span className="text-gray-500">from yesterday</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all animate-slideInLeft animation-delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Successful Calls</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">32</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
            <span>66.7%</span>
            <span className="text-gray-500">success rate</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all animate-slideInRight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-4">
            <span className="font-medium">23</span> new this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all animate-slideInRight animation-delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Call Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8:45</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">minutes</p>
        </div>
      </div>


    
    </div>
  );
}
