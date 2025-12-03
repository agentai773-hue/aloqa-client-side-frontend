'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLeads, useDeleteLead } from '@/hooks/useLeads';
import { useSearchLeads } from '@/hooks/useSearchLeads';
import { useCallHistory } from '@/hooks/useInitiateCall';
import { useSiteVisitData } from '@/hooks/useSiteVisits';
import { useDebounce } from '@/hooks/useDebounce';
import { useWebSocket } from '@/hooks/useWebSocket';
import { updateLead } from '@/api/leads';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2, Phone, Play, Calendar, MapPin, Clock } from 'lucide-react';

export default function LeadsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Initialize WebSocket for real-time updates
  const { isConnected: wsConnected } = useWebSocket();
  
  // Regular leads query
  const { data: leads = [], isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useLeads();
  
  // Search/filter states
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const pageSize = 10;

  // Debounce search query (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Search query hook - uses DEBOUNCED search query
  const { 
    data: searchData,
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError
  } = useSearchLeads(
    debouncedSearchQuery,
    page,
    pageSize,
    filterType,
    filterStatus,
    filterDate,
    true // enabled
  );

  // Other mutations and queries
  const deleteLeadMutation = useDeleteLead();
  const { data: callHistoryData } = useCallHistory(1, 1000);
  const [recordingsSidebar, setRecordingsSidebar] = useState<any>(null);
  const [siteVisitsSidebar, setSiteVisitsSidebar] = useState<any>(null);
  const [sidebarTab, setSidebarTab] = useState<'recordings' | 'site-visits'>('recordings');
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [selectedRecording, setSelectedRecording] = useState<any>(null);

  // Monitor real-time call status updates from WebSocket
  useEffect(() => {
    if (wsConnected) {
      console.log('✅ WebSocket connected - Real-time updates enabled for leads');
    }
  }, [wsConnected]);

  // Auto-update lead_type to 'hot' when call_status becomes 'completed'
  useEffect(() => {
    if (leads && leads.length > 0) {
      leads.forEach((lead: any) => {
        if (lead.call_status === 'completed' && lead.lead_type !== 'hot') {
          // Update lead_type to hot
          updateLeadType(lead._id, 'hot');
        }
      });
    }
  }, [leads, callHistoryData]);

  const updateLeadType = async (leadId: string, newType: string) => {
    try {
      const result = await updateLead(leadId, { lead_type: newType });
      if (result.success) {
        refetchLeads();
      }
    } catch (err) {
      console.error('Error updating lead type:', err);
    }
  };

  const getLeadRecordings = (leadId: string) => {
    const calls = (callHistoryData?.data as any[]) || [];
    return calls.filter(call => call.leadId === leadId && call.recordingUrl);
  };

  // Group recordings by phone number
  const groupRecordingsByPhoneNumber = (recordings: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    recordings.forEach(recording => {
      const phoneNumber = recording.phoneNumberId || recording.recipientPhoneNumber || 'Unknown';
      if (!grouped[phoneNumber]) {
        grouped[phoneNumber] = [];
      }
      grouped[phoneNumber].push(recording);
    });
    return grouped;
  };

  const handleViewRecordings = (leadId: string, leadName: string, leadData?: any) => {
    const recordings = getLeadRecordings(leadId);
    const groupedByPhone = groupRecordingsByPhoneNumber(recordings);
    setRecordingsSidebar({ leadId, leadName, recordings, groupedByPhone, scheduledCallTime: leadData?.scheduled_call_time, scheduledCallReason: leadData?.scheduled_call_reason });
  };

  const handlePlayRecording = (call: any) => {
    setSelectedRecording(call);
    setRecordingsSidebar(null);
  };

  const handleViewSiteVisits = (leadId: string, leadName: string, leadData: any) => {
    setSiteVisitsSidebar({ leadId, leadName, leadData });
    setSidebarTab('site-visits');
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setDeleteError('');
      setDeleteSuccess('');
      try {
        await deleteLeadMutation.mutateAsync(id);
        setDeleteSuccess('Lead deleted successfully!');
        setTimeout(() => setDeleteSuccess(''), 3000);
      } catch (err: any) {
        setDeleteError(err.message || 'Failed to delete lead');
      }
    }
  };

  const getLeadTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'cold':
        return 'bg-blue-100 text-blue-800';
      case 'fake':
        return 'bg-gray-100 text-gray-800';
      case 'connected':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCallStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'not_connected':
        return 'bg-red-100 text-red-800';
      case 'callback':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Determine if we should use search/filter results
  const hasFiltersActive = filterType !== 'all' || filterStatus !== 'all' || filterDate !== 'all';
  const shouldUseSearch = debouncedSearchQuery.trim() || hasFiltersActive;

  // Use search results if searching/filtering, otherwise use regular leads data
  const displayedLeads = shouldUseSearch ? (searchData?.data as any[]) || [] : leads || [];
  const pagination = shouldUseSearch ? searchData?.pagination : { total: leads?.length || 0, page: 1, pageSize: 10, totalPages: 1 };
  const isLoading = shouldUseSearch ? isSearching : leadsLoading;
  const hasError = shouldUseSearch ? isSearchError : !!leadsError;
  const errorMessage = shouldUseSearch ? searchError : leadsError;

  // Debug effect
  useEffect(() => {
    // Reset to page 1 when search query or filters change
    setPage(1);
  }, [debouncedSearchQuery, filterType, filterStatus, filterDate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-black bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Lead Management</h1>
          <p className="text-gray-600 mt-2 text-lg font-medium">Manage and track your real estate leads effortlessly</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 px-0 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, phone, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              />
            </div>

            {/* Lead Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                <option value="hot">Hot</option>
                <option value="cold">Cold</option>
                <option value="fake">Fake</option>
                <option value="connected">Connected</option>
              </select>
            </div>

            {/* Call Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Call Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="connected">Connected</option>
                <option value="not_connected">Not Connected</option>
                <option value="callback">Callback</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_week">Last 7 Days</option>
                <option value="last_month">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          {/* <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-bold text-green-600">{filteredLeads.length}</span> lead{filteredLeads.length !== 1 ? 's' : ''} 
            {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterDate !== 'all' ? ' (filtered)' : ''}
          </div> */}
        </div>

        {/* Alert Messages */}
        {deleteError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 shadow-sm">
            <span className="text-2xl">⚠️</span>
            <span className="font-medium">{deleteError}</span>
          </div>
        )}

        {deleteSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3 shadow-sm">
            <span className="text-2xl">✓</span>
            <span className="font-medium">{deleteSuccess}</span>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-green-100">
          {/* Table Container */}
          <div className="overflow-x-auto">
            {isLoading && (
              <div className="p-12 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent"></div>
                <p className="mt-4 text-lg">Loading leads...</p>
              </div>
            )}

            {!isLoading && (!leads || leads.length === 0) && !shouldUseSearch && (
              <div className="p-12 text-center text-gray-500">
                <p className="text-2xl font-semibold text-gray-700 mb-2">No leads found</p>
                <p className="text-base">Create your first lead to get started</p>
              </div>
            )}

            {!isLoading && leads && leads.length > 0 && displayedLeads.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <p className="text-2xl font-semibold text-gray-700 mb-2">No leads match your filters</p>
                <p className="text-base">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {!isLoading && displayedLeads && displayedLeads.length > 0 && (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-[#34DB17] to-[#306B25] border-b border-green-200">
                      <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Lead Type
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Call Status
                      </th>
                      <th className="px-6 py-5 text-center text-sm font-bold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedLeads.map((lead: any) => (
                      <tr key={lead._id} className="hover:bg-green-50 transition-all duration-300">
                        <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                          {lead.full_name}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          <a href={`tel:${lead.contact_number}`} className="text-green-600 hover:text-green-700 hover:underline font-medium transition-colors">
                            {lead.contact_number}
                          </a>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {lead.project_name || '-'}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all ${getLeadTypeBadgeColor(lead.lead_type)}`}>
                            {lead.lead_type.charAt(0).toUpperCase() + lead.lead_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all ${getCallStatusBadgeColor(lead.call_status)}`}>
                            {lead.call_status.replace('_', ' ').charAt(0).toUpperCase() + lead.call_status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => router.push(`/edit-lead/${lead._id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                              title="View & Edit Lead"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {/* CALL BUTTON DISABLED - Only auto-call allowed */}
                            {/* Manual call button removed - status updates via auto-call only */}
                            {(lead.call_status === 'completed' || lead.call_status === 'scheduled') ? (
                              <>
                                {/* Show Recordings Button if recordings exist */}
                                {getLeadRecordings(lead._id).length > 0 && (
                                  <button
                                    onClick={() => handleViewRecordings(lead._id, lead.full_name, lead)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-200"
                                    title={`View ${getLeadRecordings(lead._id).length} Recording(s)`}
                                  >
                                    <Play className="h-5 w-5 fill-current" />
                                  </button>
                                )}
                                {/* Show Schedule/Site Visit Button */}
                                <button
                                  onClick={() => handleViewSiteVisits(lead._id, lead.full_name, lead)}
                                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200"
                                  title="Schedule Site Visit"
                                >
                                  <Calendar className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <button
                                disabled
                                className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                                title="Available after call completion"
                              >
                                <Calendar className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              disabled={deleteLeadMutation.isPending}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Info */}
                <div className="px-8 py-5 border-t border-green-100 bg-linear-to-r from-green-50 to-emerald-50">
                  <p className="text-sm font-semibold text-gray-700">
                    📊 Showing <span className="text-green-600 font-bold">1-{Math.min(displayedLeads.length, 10)}</span> from <span className="text-green-600 font-bold">{pagination?.total || 0}</span> leads
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recording Modal */}
      {selectedRecording && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedRecording(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">{selectedRecording.callerName || 'Call Recording'}</h3>
              
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
              {(() => {
                const hasTranscript = selectedRecording.executionDetails?.transcript;
                
                if (!hasTranscript) {
                  return null;
                }
                
                return (
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
                );
              })()}

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
      {recordingsSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setRecordingsSidebar(null)}
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
                  <p className="text-sm text-gray-600 mt-1">{recordingsSidebar.leadName}</p>
                </div>
                <button
                  onClick={() => setRecordingsSidebar(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Scheduled Callback Info */}
              {recordingsSidebar?.scheduledCallTime && (
                <div className="p-6 border-b border-blue-200 bg-blue-50">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">📅 Scheduled Callback</h3>
                  <p className="text-sm text-blue-700">
                    {new Date(recordingsSidebar.scheduledCallTime).toLocaleString()}
                  </p>
                  {recordingsSidebar?.scheduledCallReason && (
                    <p className="text-xs text-blue-600 mt-1">
                      Reason: {recordingsSidebar.scheduledCallReason}
                    </p>
                  )}
                </div>
              )}

              {/* Recordings List - Grouped by Phone Number */}
              <div className="p-6 space-y-6">
                {recordingsSidebar?.recordings?.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No recordings found</p>
                ) : (
                  Object.entries(recordingsSidebar?.groupedByPhone || {}).map(([phoneNumber, recordings]) => (
                    <div key={phoneNumber} className="border border-green-200 rounded-lg overflow-hidden">
                      {/* Phone Number Header */}
                      <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                        <p className="text-sm font-semibold text-green-900">
                          📞 {phoneNumber}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {(recordings as any[]).length} recording{(recordings as any[]).length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Recordings for this phone number */}
                      <div className="divide-y divide-green-100">
                        {(recordings as any[]).map((recording: any, idx: number) => (
                          <div key={idx} className="p-4 hover:bg-gray-50 transition">
                            {/* Recording Info */}
                            <div className="mb-3">
                              <p className="text-xs text-gray-600">
                                {new Date(recording.createdAt).toLocaleDateString()} at {new Date(recording.createdAt).toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Duration: {recording.callDuration || 0}s
                              </p>
                              {recording.conversationTranscript && (
                                <p className="text-xs text-blue-600 mt-1 truncate">
                                  📝 Transcript available
                                </p>
                              )}
                            </div>

                            {/* Audio Player */}
                            <div className="mb-3 bg-gray-50 rounded p-2">
                              <audio controls className="w-full h-8">
                                <source src={recording.recordingUrl} type="audio/mpeg" />
                              </audio>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePlayRecording(recording)}
                                className="flex-1 text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              >
                                Full View
                              </button>
                              {recording.conversationTranscript && (
                                <button
                                  onClick={() => {
                                    setSelectedRecording(recording);
                                    setRecordingsSidebar(null);
                                  }}
                                  className="flex-1 text-xs px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                                >
                                  Transcript
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Site Visits Sidebar */}
      {siteVisitsSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSiteVisitsSidebar(null)}
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
                  <h2 className="text-xl font-bold text-gray-900">Site Visits</h2>
                  <p className="text-sm text-gray-600 mt-1">{siteVisitsSidebar.leadName}</p>
                </div>
                <button
                  onClick={() => setSiteVisitsSidebar(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Site Visits List */}
              <SiteVisitsList 
                leadId={siteVisitsSidebar.leadId} 
                leadData={siteVisitsSidebar.leadData}
                callHistoryData={callHistoryData}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Component to display site visits for a lead
 */
function SiteVisitsList({ 
  leadId, 
  leadData, 
  callHistoryData 
}: { 
  leadId: string; 
  leadData: any;
  callHistoryData?: any;
}) {
  const { allSiteVisits, upcomingSiteVisits, completedSiteVisits, isLoading, error } = useSiteVisitData(leadId);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const visitsToDisplay =
    activeFilter === 'upcoming' ? upcomingSiteVisits : activeFilter === 'completed' ? completedSiteVisits : allSiteVisits;

  // Get recordings for this lead
  const leadRecordings = React.useMemo(() => {
    if (!callHistoryData?.data) return [];
    const calls = callHistoryData.data as any[];
    return calls.filter(call => call.leadId === leadId && call.recordingUrl);
  }, [callHistoryData, leadId]);

  return (
    <div className="p-6 space-y-4">
      {/* Lead Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-gray-900">{leadData?.full_name}</p>
        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
          <Phone className="h-3 w-3" />
          {leadData?.contact_number}
        </p>
        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          {leadData?.project_name || 'N/A'}
        </p>
      </div>

      {/* Recordings Section */}
      {leadRecordings.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Play className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-semibold text-gray-900">Recordings ({leadRecordings.length})</p>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {leadRecordings.map((recording: any, idx: number) => (
              <div key={idx} className="bg-white p-2 rounded border border-purple-100 text-xs">
                <p className="font-medium text-gray-900">Recording {idx + 1}</p>
                <p className="text-gray-600 mt-0.5">
                  {new Date(recording.createdAt).toLocaleDateString()} at {new Date(recording.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-gray-600">Duration: {recording.callDuration || 0}s</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeFilter === 'upcoming'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingSiteVisits.length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeFilter === 'completed'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedSiteVisits.length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeFilter === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({allSiteVisits.length})
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          Error loading site visits: {(error as any)?.message}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && visitsToDisplay.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-600 text-sm">No {activeFilter === 'upcoming' ? 'upcoming' : activeFilter === 'completed' ? 'completed' : ''} site visits</p>
        </div>
      )}

      {/* Site Visits List */}
      {!isLoading && visitsToDisplay.length > 0 && (
        <div className="space-y-3">
          {visitsToDisplay.map((visit: any) => (
            <div key={visit._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              {/* Date */}
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(visit.visitDate).toLocaleDateString()}
                </p>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">{visit.visitTime}</p>
              </div>

              {/* Project */}
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{visit.projectName}</p>
                  {visit.address && <p className="text-xs text-gray-600">{visit.address}</p>}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
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

              {/* Notes */}
              {visit.notes && <p className="text-xs text-gray-600 mt-2 italic">{visit.notes}</p>}

              {/* Extracted Badge */}
              {visit.extractedFromTranscript && (
                <p className="text-xs text-purple-600 mt-2">📍 Extracted from call</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
