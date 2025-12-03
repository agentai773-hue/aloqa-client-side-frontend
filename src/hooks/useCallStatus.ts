import { useQuery } from '@tanstack/react-query';
import { useWebSocketContext } from '@/components/providers/WebSocketProvider';
import { useEffect, useCallback, useState } from 'react';
import axiosInstance from '@/utils/api';

export interface CallStatus {
  callId: string;
  leadId: string;
  status: 'initiated' | 'queued' | 'ringing' | 'connected' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  duration?: number;
  recordingUrl?: string;
  timestamp: string;
}

/**
 * Hook to listen to real-time call status updates via WebSocket
 * No polling, pure WebSocket for instant updates
 *
 * Usage:
 * const { callStatus, isListening } = useCallStatusWebSocket(leadId);
 */
export function useCallStatusWebSocket(leadId: string | null) {
  const { subscribeLead, unsubscribeLead, onCallStatusUpdated, requestCallStatus } = useWebSocketContext();
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Subscribe to lead and setup listeners
  useEffect(() => {
    if (!leadId) {
      setIsListening(false);
      return;
    }

    try {
      // Subscribe to lead updates
      subscribeLead(leadId);
      setIsListening(true);

      // Request current call status
      requestCallStatus(leadId);

      // Listen to call status updates
      const unsubscribe = onCallStatusUpdated((data) => {
        if (data.leadId === leadId) {
          setCallStatus({
            callId: data.callDetails?.callId || '',
            leadId: data.leadId,
            status: data.status,
            duration: data.callDetails?.callDuration,
            recordingUrl: data.callDetails?.recordingUrl,
            timestamp: data.timestamp,
          });
        }
      });

      return () => {
        unsubscribeLead(leadId);
        unsubscribe?.();
        setIsListening(false);
      };
    } catch (error) {
      console.error('Error setting up call status listener:', error);
      setIsListening(false);
    }
  }, [leadId, subscribeLead, unsubscribeLead, onCallStatusUpdated, requestCallStatus]);

  return { callStatus, isListening };
}

/**
 * Hook to listen to real-time lead status changes via WebSocket
 *
 * Usage:
 * const { leadStatus, isUpdating } = useLeadStatusWebSocket(leadId);
 */
export function useLeadStatusWebSocket(leadId: string | null) {
  const { subscribeLead, unsubscribeLead, onLeadStatusChanged } = useWebSocketContext();
  const [leadStatus, setLeadStatus] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!leadId) {
      return;
    }

    try {
      subscribeLead(leadId);
      setIsUpdating(true);

      const unsubscribe = onLeadStatusChanged((data) => {
        if (data.leadId === leadId) {
          setLeadStatus({
            call_status: data.data?.call_status,
            lead_type: data.data?.lead_type,
            eventType: data.eventType,
            timestamp: data.timestamp,
          });
        }
      });

      return () => {
        unsubscribeLead(leadId);
        unsubscribe?.();
        setIsUpdating(false);
      };
    } catch (error) {
      console.error('Error setting up lead status listener:', error);
      setIsUpdating(false);
    }
  }, [leadId, subscribeLead, unsubscribeLead, onLeadStatusChanged]);

  return { leadStatus, isUpdating };
}

/**
 * Hook to listen to call started events via WebSocket
 *
 * Usage:
 * const { callData, callStarted } = useCallStartedWebSocket(leadId);
 */
export function useCallStartedWebSocket(leadId: string | null) {
  const { onCallStarted } = useWebSocketContext();
  const [callData, setCallData] = useState<any>(null);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    if (!leadId) {
      return;
    }

    const unsubscribe = onCallStarted((data) => {
      if (data.leadId === leadId) {
        setCallData(data.call);
        setCallStarted(true);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [leadId, onCallStarted]);

  return { callData, callStarted };
}

/**
 * Hook to listen to call completed events via WebSocket
 *
 * Usage:
 * const { completedCall, isCompleted } = useCallCompletedWebSocket(leadId);
 */
export function useCallCompletedWebSocket(leadId: string | null) {
  const { onCallCompleted } = useWebSocketContext();
  const [completedCall, setCompletedCall] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!leadId) {
      return;
    }

    const unsubscribe = onCallCompleted((data) => {
      if (data.leadId === leadId) {
        setCompletedCall(data.call);
        setIsCompleted(true);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [leadId, onCallCompleted]);

  return { completedCall, isCompleted };
}

/**
 * Get single lead with real-time WebSocket updates (no polling)
 * Returns lead data + real-time status updates
 */
export function useLead(leadId: string | null) {
  // Get initial lead data from API
  const { data: lead, ...queryProps } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('Lead ID is required');
      const response = await axiosInstance.get(`/api/client-leads/${leadId}`);
      return response.data.data;
    },
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get real-time status updates via WebSocket
  const { callStatus } = useCallStatusWebSocket(leadId);
  const { leadStatus } = useLeadStatusWebSocket(leadId);

  // Combine API data with real-time updates
  const updatedLead = lead && {
    ...lead,
    call_status: leadStatus?.call_status || lead.call_status,
    lead_type: leadStatus?.lead_type || lead.lead_type,
  };

  return {
    ...queryProps,
    data: updatedLead,
    callStatus,
    leadStatus,
  };
}
