"use client";

import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  CheckCircle2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useAssistants } from "@/hooks/useAssistants";
import { useCallHistory } from "@/hooks/useInitiateCall";

export default function DashboardPage() {
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected">("idle");
  
  // Fetch leads
  const { data: leadsData = [] } = useLeads();
  const leads = Array.isArray(leadsData) ? leadsData : [];
  const totalLeads = leads.length;

  // Fetch assistants
  const { data: assistantsData } = useAssistants();
  const assistants = assistantsData?.data || [];
  const activeBots = assistants.length;

  // Fetch call history
  const { data: callHistoryData } = useCallHistory(1, 1000);
  const callHistory = Array.isArray(callHistoryData?.data) ? callHistoryData.data : [];
  const totalCalls = callHistory.length;

  const startCall = () => {
    setCallStatus("calling");
    setTimeout(() => setCallStatus("connected"), 2000);
  };

  const endCall = () => {
    setCallStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#34DB17] to-[#306B25] bg-clip-text text-transparent">Client Calling Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Real Estate Client Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Leads */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <PhoneCall className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#34DB17] mt-4 flex items-center gap-1 font-semibold">
              <span>↑ 12%</span>
              <span className="text-gray-500 font-normal">from yesterday</span>
            </p>
          </div>

          {/* Total Calls */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Calls</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCalls}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#34DB17] mt-4 flex items-center gap-1 font-semibold">
              <span>66.7%</span>
              <span className="text-gray-500 font-normal">success rate</span>
            </p>
          </div>

          {/* Active Bot */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Active Bot</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeBots}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#34DB17] mt-4 font-semibold">
              <span>23</span>
              <span className="text-gray-500 font-normal"> new this week</span>
            </p>
          </div>

          {/* Total Minutes */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Minutes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">8:45</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">minutes used</p>
          </div>

          {/* Remaining Minutes */}
          <div className="stat-card card-gradient p-6 rounded-2xl card-hover transition-all duration-300 cursor-pointer shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Remaining</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">2040</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">minutes left</p>
          </div>
        </div>

      </div>
    </div>
  );
}
