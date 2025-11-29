"use client";

import { Calendar } from "lucide-react";
import { useState, useCallback } from "react";
import SiteVisitsTable, { type SiteVisit } from "@/components/site-visits";

export default function SiteVisitsSchedulePage() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);

  const handleDataLoaded = useCallback((visits: SiteVisit[]) => {
    setSiteVisits(visits);
  }, []);

  const scheduledCount = siteVisits.filter(v => v.status === 'scheduled').length;
  const completedCount = siteVisits.filter(v => v.status === 'completed').length;
  const cancelledCount = siteVisits.filter(v => v.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      <style>{`
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
        
        .page-header {
          animation: slideInDown 0.6s ease-out forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#34DB17] to-[#306B25] bg-clip-text text-transparent">
            Site Visits Schedule
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage and track all scheduled site visits</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scheduled */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-[#34DB17]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{scheduledCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-[#34DB17]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-[#34DB17]/20 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-[#306B25]">✓</span>
              </div>
            </div>
          </div>

          {/* Cancelled */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-[#34DB17]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Cancelled</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{cancelledCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-red-600">✕</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Site Visits</h2>
          <SiteVisitsTable onDataLoaded={handleDataLoaded} />
        </div>
      </div>
    </div>
  );
}
