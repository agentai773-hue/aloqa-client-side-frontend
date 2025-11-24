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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Interface */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Call</h2>
          
          <div className="space-y-4">
            {/* Client Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Rajesh Kumar - Looking for 2BHK in Mumbai</option>
                <option>Priya Sharma - Interested in commercial space</option>
                <option>Amit Patel - Villa in Pune budget 1.5Cr</option>
                <option>Sneha Reddy - First time buyer, needs guidance</option>
              </select>
            </div>

            {/* Call Status */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              {callStatus === "idle" && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-gray-600">Ready to make a call</p>
                  <button
                    onClick={startCall}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PhoneCall className="w-5 h-5" />
                    Start Call
                  </button>
                </div>
              )}

              {callStatus === "calling" && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Phone className="w-10 h-10 text-blue-600 animate-bounce" />
                  </div>
                  <p className="text-blue-600 font-medium">Calling...</p>
                  <button
                    onClick={endCall}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PhoneOff className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              )}

              {callStatus === "connected" && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <PhoneCall className="w-10 h-10 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Call Connected</p>
                  <div className="text-2xl font-mono text-gray-900">00:45</div>
                  <button
                    onClick={endCall}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PhoneOff className="w-5 h-5" />
                    End Call
                  </button>
                </div>
              )}
            </div>

            {/* Quick Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Notes
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about the call..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Schedule</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { time: "10:00 AM", client: "Rajesh Kumar", type: "Follow-up", status: "upcoming" },
              { time: "11:30 AM", client: "Priya Sharma", type: "Site Visit", status: "upcoming" },
              { time: "02:00 PM", client: "Amit Patel", type: "Documentation", status: "completed" },
              { time: "04:30 PM", client: "Sneha Reddy", type: "First Call", status: "upcoming" },
            ].map((schedule, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  schedule.status === "completed"
                    ? "bg-green-50 border-green-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {schedule.time}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      schedule.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {schedule.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{schedule.client}</p>
                <p className="text-xs text-gray-600">{schedule.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Calls</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { 
                client: "Rajesh Kumar", 
                time: "2 minutes ago", 
                duration: "8:32",
                status: "success",
                note: "Interested in 2BHK, scheduling site visit"
              },
              { 
                client: "Priya Sharma", 
                time: "1 hour ago", 
                duration: "12:15",
                status: "success",
                note: "Discussed commercial properties in Andheri"
              },
              { 
                client: "Amit Patel", 
                time: "3 hours ago", 
                duration: "5:45",
                status: "missed",
                note: "No response - will try again later"
              },
              { 
                client: "Sneha Reddy", 
                time: "5 hours ago", 
                duration: "15:20",
                status: "success",
                note: "First time buyer consultation completed"
              },
            ].map((call, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
              >
                <div className={`w-10 h-10 ${
                  call.status === "success" ? "bg-green-100" : "bg-red-100"
                } rounded-lg flex items-center justify-center shrink-0`}>
                  {call.status === "success" ? (
                    <PhoneCall className="w-5 h-5 text-green-600" />
                  ) : (
                    <PhoneOff className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{call.client}</p>
                    <span className="text-xs text-gray-500">{call.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{call.note}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {call.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
