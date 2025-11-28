"use client";

import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  CheckCircle2,
  Users,
  Calendar,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLeads } from "@/hooks/useLeads";

export default function DashboardPage() {
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected">("idle");
  const [showScheduleSidebar, setShowScheduleSidebar] = useState(false);
  const { data: leadsData = [] } = useLeads();
  const leads = Array.isArray(leadsData) ? leadsData : [];

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
              <p className="text-sm text-gray-600 font-medium">Total Leads</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Calls</p>
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
              <p className="text-sm text-gray-600 font-medium">Active Bot</p>
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
              <p className="text-sm text-gray-600 font-medium">Total minutes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8:45</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">minutes</p>
        </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all animate-slideInRight animation-delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Remainings minutes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8:45</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">minutes</p>
        </div>


      </div>

      {/* Schedule Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowScheduleSidebar(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          View All Site Visits
        </button>
      </div>

      {/* Schedule Sidebar */}
      {showScheduleSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setShowScheduleSidebar(false)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto">
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div className="animate-[slideIn_0.3s_ease-out]">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">All Site Visits Schedule</h2>
                <button
                  onClick={() => setShowScheduleSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Table Content */}
              <div className="p-6">
                <ScheduleTable leads={leads} />
              </div>
            </div>
          </div>
        </>
      )}
    
    </div>
  );
}

/**
 * Schedule Table Component - Shows all site visits in table format
 */
function ScheduleTable({ leads }: { leads: any[] }) {
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all site visits for all leads
  useEffect(() => {
    const fetchAllSiteVisits = async () => {
      try {
        setIsLoading(true);
        const allVisits: any[] = [];

        for (const lead of leads) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/client-site-visits/lead/${lead._id}`,
              {
                credentials: 'include',
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.data && Array.isArray(data.data)) {
                // Add lead info to each visit
                const visitsWithLeadInfo = data.data.map((visit: any) => ({
                  ...visit,
                  leadName: lead.full_name,
                  leadPhone: lead.contact_number,
                  projectName: lead.project_name,
                }));
                allVisits.push(...visitsWithLeadInfo);
              }
            }
          } catch (error) {
            console.error(`Error fetching site visits for lead ${lead._id}:`, error);
          }
        }

        // Sort by date
        allVisits.sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
        setSiteVisits(allVisits);
      } catch (error) {
        console.error('Error fetching site visits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (leads.length > 0) {
      fetchAllSiteVisits();
    } else {
      setIsLoading(false);
    }
  }, [leads]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  if (siteVisits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600 text-lg">No site visits scheduled</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lead Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Project</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Address</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
          </tr>
        </thead>
        <tbody>
          {siteVisits.map((visit: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{visit.leadName}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{visit.leadPhone}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(visit.visitDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{visit.visitTime}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{visit.projectName}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{visit.address || '-'}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    visit.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : visit.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : visit.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {visit.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{visit.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
