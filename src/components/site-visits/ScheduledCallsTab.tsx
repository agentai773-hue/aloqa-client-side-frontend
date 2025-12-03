import React, { useState } from 'react';
import { useCallSchedule } from '@/hooks/useCallSchedule';
import { Clock, X, Edit2 } from 'lucide-react';

interface ScheduledCallsTabProps {
  leadId: string | null;
}

export function ScheduledCallsTab({ leadId }: ScheduledCallsTabProps) {
  const {
    scheduledCall,
    isLoading,
    reschedule,
    rescheduling,
    cancel,
    cancelling,
  } = useCallSchedule(leadId);

  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newScheduledTime, setNewScheduledTime] = useState('');
  const [reason, setReason] = useState('');

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!scheduledCall) {
    return (
      <div className="p-4 text-center text-gray-500">
        No scheduled calls for this lead
      </div>
    );
  }

  const handleReschedule = () => {
    if (newScheduledTime) {
      reschedule(
        {
          scheduledTime: newScheduledTime,
          reason: reason || 'Rescheduled call',
        },
        {
          onSuccess: () => {
            setShowRescheduleForm(false);
            setNewScheduledTime('');
            setReason('');
          },
        }
      );
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this scheduled call?')) {
      cancel();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Scheduled Call</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Time:</span>{' '}
                <span className="font-medium">
                  {formatDateTime(scheduledCall.scheduledTime)}
                </span>
              </p>
              {scheduledCall.reason && (
                <p>
                  <span className="text-gray-600">Reason:</span>{' '}
                  <span className="font-medium">{scheduledCall.reason}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowRescheduleForm(!showRescheduleForm)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
            disabled={rescheduling}
          >
            <Edit2 className="w-4 h-4" />
            Reschedule
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
            disabled={cancelling}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      {showRescheduleForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Reschedule Call</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Date & Time
            </label>
            <input
              type="datetime-local"
              value={newScheduledTime}
              onChange={(e) => setNewScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer requested callback in 2 hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReschedule}
              disabled={rescheduling || !newScheduledTime}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {rescheduling ? 'Rescheduling...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setShowRescheduleForm(false);
                setNewScheduledTime('');
                setReason('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
