'use client';

import { useState, useEffect } from 'react';
import { useCallHistory } from '@/hooks/useInitiateCall';
import { Phone, Download, Loader, AlertCircle, Play, X, Pause, RefreshCw, Clock } from 'lucide-react';
import axios from 'axios';

export default function CallHistoryTab() {
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const pageSize = 10;
  
  const { data: callHistoryData, isLoading, isError, error, refetch } = useCallHistory(page, pageSize);

  const calls = (callHistoryData?.data as any[]) || [];
  const pagination = callHistoryData?.pagination;

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch?.();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

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

  const checkCallStatus = async () => {
    if (!selectedCall?._id) return;

    setIsCheckingStatus(true);
    try {
      const response = await axios.post(
        `/api/client-call/call-history/check-status/${selectedCall._id}`,
        {}
      );

      if (response.data.success && response.data.data) {
        // Update the selected call with latest data
        setSelectedCall(response.data.data);
        // Also refetch the list to update the table
        refetch?.();
      }
    } catch (err) {
      console.error('Error checking call status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
          <p className="text-gray-600 mt-2">
            View all your call records and recordings
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              autoRefresh 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled (every 5s)' : 'Auto-refresh disabled'}
          >
            <RefreshCw className="w-4 h-4" />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={() => refetch?.()}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error?.message || 'Failed to load call history'}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading call history...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && calls.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <Phone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No calls found. Start making calls!</p>
        </div>
      )}

      {/* Call History Table */}
      {!isLoading && calls.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Recording
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {calls.map((call: any) => (
                  <tr key={call._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedCall(call)}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>
                        <p>{call.callerName || '-'}</p>
                        <p className="text-gray-600 text-xs">{call.recipientPhoneNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {call.projectName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
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
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          title="Play recording"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">Play</span>
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
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Call Details</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCall.callerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900 break-all">{selectedCall.recipientPhoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Call Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Call Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Project</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCall.projectName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedCall.status)}`}>
                      {selectedCall.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="text-sm font-medium text-gray-900">{calculateDuration(selectedCall.createdAt, selectedCall.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Started At</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedCall.createdAt)}</p>
                  </div>
                  <button
                    onClick={checkCallStatus}
                    disabled={isCheckingStatus}
                    className="w-full mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                  >
                    <Clock className="w-4 h-4" />
                    {isCheckingStatus ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              </div>

              {/* Recording Section */}
              {selectedCall.recordingUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recording</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <audio
                        controls
                        autoPlay={isPlaying}
                        className="w-full"
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full justify-center"
                    >
                      <Download className="w-4 h-4" />
                      Download Recording
                    </a>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Technical Details</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Call ID</p>
                    <p className="text-xs font-mono text-gray-900 break-all">{selectedCall.callId || selectedCall._id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Agent ID</p>
                    <p className="text-xs font-mono text-gray-900 break-all">{selectedCall.agentId || '-'}</p>
                  </div>
                  {selectedCall.recordingId && (
                    <div>
                      <p className="text-xs text-gray-600">Recording ID</p>
                      <p className="text-xs font-mono text-gray-900 break-all">{selectedCall.recordingId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
