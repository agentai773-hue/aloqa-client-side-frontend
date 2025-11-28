"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Phone, Play, X } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useCallHistory } from "@/hooks/useInitiateCall";

export default function SiteVisitsPage() {
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLeadRecordings, setSelectedLeadRecordings] = useState<any>(null);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const { data: leadsData = [] } = useLeads();
  const { data: callHistoryData } = useCallHistory(1, 1000);
  const leads = Array.isArray(leadsData) ? leadsData : [];

  // Get recordings for a specific lead
  const getLeadRecordings = (leadId: string) => {
    const calls = (callHistoryData?.data as any[]) || [];
    return calls.filter(call => call.leadId === leadId && call.recordingUrl);
  };

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
                  leadId: lead._id,
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

  // Filter site visits based on status
  const filteredVisits = filterStatus === 'all' 
    ? siteVisits 
    : siteVisits.filter(visit => visit.status === filterStatus);

  const statuses = ['all', 'scheduled', 'completed', 'cancelled', 'rescheduled'];

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Visits Schedule</h1>
        <p className="text-gray-600 mt-2">Manage all scheduled property visits</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Total Scheduled</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {siteVisits.filter(v => v.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {siteVisits.filter(v => v.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {siteVisits.filter(v => v.status === 'cancelled').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Rescheduled</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {siteVisits.filter(v => v.status === 'rescheduled').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition capitalize ${
              filterStatus === status
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status === 'all' ? 'All' : status} ({siteVisits.filter(v => status === 'all' ? true : v.status === status).length})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 text-lg">No site visits found</p>
        </div>
      ) : (
        /* Site Visits Grid */
        <div className="grid grid-cols-1 gap-4">
          {filteredVisits.map((visit: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{visit.leadName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{visit.projectName}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
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
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {new Date(visit.visitDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Time</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{visit.visitTime}</p>
                  </div>
                </div>

                {/* Phone with Recordings */}
                <div className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                  onClick={() => {
                    const recordings = getLeadRecordings(visit.leadId || visit._id);
                    if (recordings.length > 0) {
                      setSelectedLeadRecordings({ 
                        leadName: visit.leadName, 
                        leadPhone: visit.leadPhone,
                        recordings 
                      });
                    }
                  }}>
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{visit.leadPhone}</p>
                    {getLeadRecordings(visit.leadId || visit._id).length > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                        <Play className="h-3 w-3 fill-current" />
                        {getLeadRecordings(visit.leadId || visit._id).length} Recording(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Location</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {visit.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {visit.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{visit.notes}</p>
                </div>
              )}

              {/* Extracted Badge */}
              {visit.extractedFromTranscript && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-purple-600 font-medium">📍 Extracted from call transcript</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recording Detail Modal */}
      {selectedRecording && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedRecording(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedRecording.callerName || 'Call Recording'}</h3>
                <button
                  onClick={() => setSelectedRecording(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Audio Player */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <audio
                  controls
                  autoPlay
                  className="w-full"
                >
                  <source src={selectedRecording.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              {/* Details */}
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p><strong>Duration:</strong> {selectedRecording.callDuration || 0}s</p>
                <p><strong>Date:</strong> {new Date(selectedRecording.createdAt).toLocaleDateString()} at {new Date(selectedRecording.createdAt).toLocaleTimeString()}</p>
                <p><strong>Project:</strong> {selectedRecording.projectName || '-'}</p>
              </div>

              {/* Transcript Section */}
              {selectedRecording.executionDetails?.transcript && (
                <div className="mb-6 border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Transcript</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-3 text-sm">
                      {selectedRecording.executionDetails.transcript.split('\n').map((line: string, idx: number) => {
                        const isAgent = line.toLowerCase().startsWith('assistant:');
                        const text = line.replace(/^(assistant:|user:)\s*/i, '').trim();
                        
                        if (!text) return null;
                        
                        return (
                          <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-xs rounded-lg p-3 ${
                              isAgent 
                                ? 'bg-blue-100 text-gray-900 border-l-4 border-blue-600' 
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                {isAgent ? 'Assistant' : 'User'}
                              </p>
                              <p className="text-sm leading-relaxed">{text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <a
                  href={selectedRecording.recordingUrl}
                  download
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm"
                >
                  Download
                </a>
                <button
                  onClick={() => setSelectedRecording(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recordings Sidebar */}
      {selectedLeadRecordings && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedLeadRecordings(null)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div className="animate-[slideIn_0.3s_ease-out]">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recordings</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedLeadRecordings.leadName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    {selectedLeadRecordings.leadPhone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLeadRecordings(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Recordings List */}
              <div className="p-6 space-y-4">
                {selectedLeadRecordings.recordings.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No recordings found</p>
                ) : (
                  selectedLeadRecordings.recordings.map((recording: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      {/* Recording Info */}
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          Recording {idx + 1}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(recording.createdAt).toLocaleDateString()} at {new Date(recording.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Duration: {recording.callDuration || 0}s
                        </p>
                      </div>

                      {/* Audio Player */}
                      <div className="mb-3 bg-gray-50 rounded p-2">
                        <audio controls className="w-full h-8">
                          <source src={recording.recordingUrl} type="audio/mpeg" />
                        </audio>
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => {
                          setSelectedRecording(recording);
                          setSelectedLeadRecordings(null);
                        }}
                        className="w-full text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Full View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
