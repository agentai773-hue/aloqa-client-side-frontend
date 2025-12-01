'use client';

import { useState, useEffect } from 'react';
import { useCallHistory } from '@/hooks/useInitiateCall';
import { useSearchCallHistory } from '@/hooks/useSearchCallHistory';
import { useSiteVisitData } from '@/hooks/useSiteVisits';
import { useAssistants } from '@/hooks/useAssistants';
import { useLeads } from '@/hooks/useLeads';
import { useDebounce } from '@/hooks/useDebounce';
import { useCheckCallStatus } from '@/hooks/useCheckCallStatus';
import { Phone, Download, Loader, AlertCircle, Play, X, Pause, RefreshCw, Clock, Calendar, MapPin, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function CallHistoryTab() {
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<'overview' | 'transcript'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assistantFilter, setAssistantFilter] = useState<string>('all');
  const pageSize = 10;
  
  const queryClient = useQueryClient();
  
  // Get mutation hook for checking call status
  const { mutate: checkStatus, isPending: isCheckingStatus } = useCheckCallStatus();
  
  // Regular call history query
  const { data: callHistoryData, isLoading: isLoadingHistory, isError, error, refetch } = useCallHistory(page, pageSize);
  
  // Search query - only enabled when debouncedSearchTerm is not empty
  const { 
    data: searchData, 
    isLoading: isSearching, 
    isError: isSearchError,
    error: searchError
  } = useSearchCallHistory(
    debouncedSearchTerm,
    page,
    pageSize,
    statusFilter,
    assistantFilter,
    true // enabled
  );
  
  const { data: assistantsData } = useAssistants();
  
  // Get site visits data if call is selected and has leadId
  const { allSiteVisits: siteVisits, isLoading: siteVisitsLoading } = useSiteVisitData(
    selectedCall?.leadId || null
  );

  // Determine if we should use search/filter results (when search term or filters are active)
  const hasFiltersActive = statusFilter !== 'all' || assistantFilter !== 'all';
  const shouldUseSearch = debouncedSearchTerm.trim() || hasFiltersActive;

  // Use search results if searching/filtering, otherwise use regular call history data
  const calls = shouldUseSearch ? (searchData?.data as any[]) || [] : (callHistoryData?.data as any[]) || [];
  const pagination = shouldUseSearch ? searchData?.pagination : callHistoryData?.pagination;
  const isLoading = shouldUseSearch ? isSearching : isLoadingHistory;
  const hasError = shouldUseSearch ? isSearchError : isError;
  const errorMessage = shouldUseSearch ? searchError : error;

  // Get assistants list from hook
  const assistants = assistantsData?.data || [];

  // Reset page to 1 when search/filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter, assistantFilter]);

  // Auto-refresh every 5 seconds if enabled (only when not searching/filtering)
  useEffect(() => {
    if (!autoRefresh || shouldUseSearch) return; // Don't auto-refresh while searching/filtering

    const interval = setInterval(() => {
      refetch?.();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch, shouldUseSearch]);

  // Monitor call status changes and invalidate leads when call completes
  useEffect(() => {
    if (selectedCall && selectedCall.status === 'completed') {
      // Invalidate leads query when selected call is completed
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  }, [selectedCall?.status, queryClient]);

  // Refresh selected call if it exists in new data
  useEffect(() => {
    if (selectedCall && calls.length > 0) {
      const updatedCall = calls.find(c => c._id === selectedCall._id);
      if (updatedCall) {
        setSelectedCall(updatedCall);
      }
    }
  }, [calls, selectedCall]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    const seconds = Math.floor((updated - created) / 1000);
    
    if (seconds <= 0) return '-';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleCheckCallStatus = () => {
    if (!selectedCall?._id) return;

    checkStatus(selectedCall._id, {
      onSuccess: (data) => {
        // Update the selected call with latest data
        setSelectedCall(data);
        // Also refetch the list to update the table
        refetch?.();
      },
    });
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'initiated': 'bg-blue-100 text-blue-800',
      'ringing': 'bg-yellow-100 text-yellow-800',
      'connected': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'queued': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-linear-to-b from-[#34DB17] to-[#306B25] rounded-full"></div>
          <h1 className="text-3xl font-bold text-[#34DB17]">Call History</h1>
        </div>
        <p className="text-gray-600 text-sm ml-4">Your call records and recordings</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mx-4 lg:mx-6 mb-6">
        <div className="p-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, phone, project..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#34DB17] focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#34DB17] focus:border-transparent transition bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="initiated">Initiated</option>
                <option value="ringing">Ringing</option>
                <option value="connected">Connected</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Assistant Filter & Clear Button */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assistant</label>
                <select
                  value={assistantFilter}
                  onChange={(e) => {
                    setAssistantFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#34DB17] focus:border-transparent transition bg-white text-sm"
                >
                  <option value="all">All Assistants</option>
                  {assistants.map((assistant) => (
                    <option key={assistant._id} value={assistant._id}>
                      {assistant.agentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== 'all' || assistantFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setAssistantFilter('all');
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-xs h-fit"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{(errorMessage as any)?.message || 'Failed to load call history'}</span>
        </div>
      )}

      {/* Loading State */}
      {(isLoading || isSearching) && (
        <div className="p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">{isSearching ? 'Searching...' : 'Loading call history...'}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isSearching && calls.length === 0 && !searchTerm.trim() && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <Phone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No calls found. Start making calls!</p>
        </div>
      )}

      {/* Empty State - No search results */}
      {!isLoading && !isSearching && calls.length === 0 && searchTerm.trim() && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <Phone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No calls match your search. Try a different search term.</p>
        </div>
      )}

      {/* Call History Table */}
      {!isLoading && !isSearching && calls.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mx-4 lg:mx-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-[#34DB17] to-[#306B25] text-white">
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Call Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Recording
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {calls.map((call: any) => (
                  <tr 
                    key={call._id} 
                    className="hover:bg-gray-50 transition cursor-pointer" 
                    onClick={() => setSelectedCall(call)}
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{call.callerName || '-'}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {call.recipientPhoneNumber}
                        </p>
                        {call.projectName && (
                          <p className="text-xs text-gray-600">{call.projectName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        call.status === 'initiated' ? 'bg-yellow-100 text-yellow-700' :
                        call.status === 'completed' ? 'bg-green-100 text-green-700' :
                        call.status === 'in_progress' || call.status === 'connected' ? 'bg-blue-100 text-blue-700' :
                        call.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {calculateDuration(call.createdAt, call.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(call.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center" onClick={(e) => e.stopPropagation()}>
                      {call.recordingUrl ? (
                        <button
                          onClick={() => {
                            setSelectedCall(call);
                            setIsPlaying(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#34DB17] text-[#34DB17] rounded-lg hover:bg-[#34DB17]/5 transition font-medium text-sm"
                          title="Play recording"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} calls
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recording Detail Sidebar */}
      {selectedCall && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedCall(null)}
          />

          {/* Sidebar */}
          <div
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out"
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <style>{`
              @keyframes slideIn {
                from {
                  transform: translateX(100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}</style>

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Call Details</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-[57px] bg-white border-b border-gray-200 flex gap-0">
              <button
                onClick={() => setDetailsTab('overview')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition ${
                  detailsTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailsTab('transcript')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition ${
                  detailsTab === 'transcript'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Transcript
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {detailsTab === 'overview' && (
                <>
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide pb-1.5">Contact</h3>
                    <div className="space-y-1.5 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{selectedCall.callerName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-semibold text-gray-900 break-all">{selectedCall.recipientPhoneNumber}</p>
                      </div>
                    </div>
                  </div>

              {/* Call Details */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide pb-1.5">Call Info</h3>
                <div className="space-y-1.5 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="font-semibold text-gray-900">{selectedCall.projectName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedCall.status)}`}>
                      {selectedCall.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{calculateDuration(selectedCall.createdAt, selectedCall.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Started</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedCall.createdAt)}</p>
                  </div>
                  <button
                    onClick={handleCheckCallStatus}
                    disabled={isCheckingStatus}
                    className="w-full mt-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center gap-1.5 transition text-xs font-semibold border border-blue-200"
                  >
                    <Clock className="w-3 h-3" />
                    {isCheckingStatus ? 'Checking...' : 'Check'}
                  </button>
                </div>
              </div>

                  {/* Recording Section */}
                  {selectedCall.recordingUrl && (
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide border-b-2 border-blue-200 pb-1.5">Recording</h3>
                  <div className="space-y-1.5">
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200">
                      <audio
                        controls
                        autoPlay={isPlaying}
                        className="w-full h-6 text-xs"
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                      >
                        <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                    <a
                      href={selectedCall.recordingUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full justify-center text-xs font-semibold shadow-sm hover:shadow-md"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                    </div>
                  )}

                  {/* Technical Details */}
                  {/* <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide border-b-2 border-blue-200 pb-1.5">Details</h3>
                    <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-start gap-2 py-1.5">
                    <p className="text-gray-500 font-medium">Call ID:</p>
                    <p className="text-gray-900 font-mono break-all text-right">{(selectedCall.callId || selectedCall._id || '-').substring(0, 12)}...</p>
                  </div>
                  <div className="flex justify-between items-start gap-2 py-1.5">
                    <p className="text-gray-500 font-medium">Agent:</p>
                    <p className="text-gray-900 font-mono break-all text-right">{(selectedCall.agentId || '-').substring(0, 12)}...</p>
                  </div>
                      {selectedCall.recordingId && (
                        <div className="flex justify-between items-start gap-2 py-1.5">
                          <p className="text-gray-500 font-medium">Recording:</p>
                          <p className="text-gray-900 font-mono break-all text-right">{selectedCall.recordingId.substring(0, 12)}...</p>
                        </div>
                      )}
                    </div>
                  </div> */}
                </>
              )}

              {detailsTab === 'transcript' && (
                <CallTranscriptTab selectedCall={selectedCall} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Transcript Tab Component
 */
function CallTranscriptTab({ selectedCall }: { selectedCall: any }) {
  const transcript = selectedCall.conversationTranscript || 
                     selectedCall.executionDetails?.transcript ||
                     selectedCall.executionDetails?.conversation ||
                     selectedCall.executionDetails?.conversation_data ||
                     selectedCall.executionDetails?.messages ||
                     null;

  if (!transcript) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No transcript available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto space-y-4">
        {typeof transcript === 'string' ? (
          <div className="space-y-3">
            {transcript.split('\n').map((line: string, idx: number) => {
              const isAgent = line.toLowerCase().startsWith('assistant:');
              const text = line.replace(/^(assistant:|user:)\s*/i, '').trim();
              
              if (!text) return null;
              
              return (
                <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-lg p-3 ${
                    isAgent 
                      ? 'bg-blue-100 text-gray-900 border-l-4 border-blue-600' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      {isAgent ? 'Assistant' : 'User'}
                    </p>
                    <p className="text-sm text-gray-900 leading-relaxed">{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : Array.isArray(transcript) ? (
          <div className="space-y-4">
            {transcript.map((msg: any, idx: number) => {
              const isAgent = msg.role === 'agent' || msg.sender === 'agent' || msg.type === 'agent_message';
              const displayText = msg.message || msg.text || msg.content || '';
              
              return (
                <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-lg p-3 ${
                    isAgent 
                      ? 'bg-blue-100 text-gray-900 border-l-4 border-blue-600' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      {isAgent ? 'Assistant' : 'User'}
                    </p>
                    <p className="text-sm text-gray-900 leading-relaxed">{displayText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Transcript format not supported</p>
        )}
      </div>
    </div>
  );
}

/**
 * Schedule Tab Component - Shows site visits for the lead
 */
function CallScheduleTab({ 
  selectedCall, 
  siteVisits, 
  siteVisitsLoading 
}: { 
  selectedCall: any;
  siteVisits: any[];
  siteVisitsLoading: boolean;
}) {
  if (siteVisitsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!siteVisits || siteVisits.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-600">No site visits scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {siteVisits.map((visit: any) => (
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

          {/* Status */}
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
  );
}
