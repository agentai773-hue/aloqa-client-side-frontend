"use client";

import { 
  Clock, 
  CheckCircle2,
  Users,
  Activity,
  PhoneCall,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDashboard, useRefreshDashboard } from "@/hooks/useDashboard";
import { DashboardStats } from "@/api/dashboard-api";

export default function DashboardPage() {
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected">("idle");
  
  // Fetch dashboard statistics
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  const { refreshDashboard } = useRefreshDashboard();

  // Extract data from dashboard API response with proper typing
  const dashStats = dashboardData as DashboardStats | undefined;
  
  // Leads data
  const totalLeads = dashStats?.leads?.total || 0;
  const leadsByType = dashStats?.leads?.byType || {};
  const leadsByStatus = dashStats?.leads?.byCallStatus || {};

  // Call history data
  const totalCalls = dashStats?.callHistory?.total || 0;
  const successfulCalls = dashStats?.callHistory?.successful || 0;
  const successRate = dashStats?.callHistory?.successRate || 0;
  const callsByStatus = dashStats?.callHistory?.byStatus || {};

  // Assistants data
  const totalAssistants = dashStats?.assistants?.total || 0;
  const activeAssistants = dashStats?.assistants?.active || 0;
  const inactiveAssistants = dashStats?.assistants?.inactive || 0;

  // Call duration data
  const totalMinutes = dashStats?.callDuration?.totalMinutes || 0;
  const remainingSeconds = dashStats?.callDuration?.remainingSeconds || 0;
  const formattedDuration = dashStats?.callDuration?.formatted || "0:00";

  const startCall = () => {
    setCallStatus("calling");
    setTimeout(() => setCallStatus("connected"), 2000);
  };

  const endCall = () => {
    setCallStatus("idle");
  };

  // Auto-refresh dashboard data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDashboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshDashboard]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .card-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid rgba(52, 219, 23, 0.1);
        }
        
        .card-hover:hover {
          border-color: rgba(52, 219, 23, 0.3);
          box-shadow: 0 20px 25px -5px rgba(52, 219, 23, 0.1);
          transform: translateY(-4px);
        }
        
        .stat-card {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        .stat-card:nth-child(5) { animation-delay: 0.5s; }
        
        .page-header {
          animation: slideInDown 0.6s ease-out forwards;
        }
        
        .icon-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#34DB17] to-[#306B25] bg-clip-text text-transparent">Client Calling Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Real Estate Client Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Leads */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <PhoneCall className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 flex items-center gap-1 font-medium">
              <span className="text-[#34DB17]">
                {leadsByType?.hot || 0} hot
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-[#34DB17]">
                {leadsByType?.cold || 0} cold
              </span>
            </p>
          </div>

          {/* Total Calls */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Calls</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCalls}</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#34DB17] mt-4 flex items-center gap-1 font-semibold">
              <span>{successRate.toFixed(1)}%</span>
              <span className="text-gray-500 font-normal">success rate</span>
            </p>
          </div>

          {/* Active Bot */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Active Bot</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeAssistants}</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#34DB17] mt-4 font-semibold">
              <span>{totalAssistants}</span>
              <span className="text-gray-500 font-normal"> total assistants</span>
            </p>
          </div>

          {/* Total Minutes */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Minutes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formattedDuration}</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">minutes used</p>
          </div>

          {/* Successful Calls */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Successful</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{successfulCalls}</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">completed calls</p>
          </div>
        </div>

      </div>
    </div>
  );
}
