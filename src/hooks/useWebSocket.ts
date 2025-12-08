import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

interface LeadStatusUpdate {
  userId: string;
  leadId: string;
  eventType: string;
  data: {
    call_status?: string;
    lead_type?: string;
    [key: string]: any;
  };
  timestamp: string;
}

interface CallStatusUpdate {
  userId: string;
  leadId: string;
  status: string;
  callDetails: Record<string, any>;
  timestamp: string;
}

interface CallStarted {
  userId: string;
  leadId: string;
  type: string;
  call: {
    callId: string;
    leadName: string;
    phoneNumber: string;
    timestamp: string;
  };
  timestamp: string;
}

interface CallCompleted {
  userId: string;
  leadId: string;
  type: string;
  call: {
    [key: string]: any;
  };
  timestamp: string;
}

/**
 * useWebSocket Hook
 * Manages WebSocket connection to backend and provides utilities for real-time updates
 * 
 * Usage:
 * const { socket, isConnected, subscribeLead, unsubscribeLead } = useWebSocket();
 * 
 * // Listen to events
 * socket?.on('lead:status_changed', (data) => {
 *   console.log('Lead status changed:', data);
 * });
 * 
 * // Subscribe to lead updates
 * subscribeLead('lead_id_123');
 */
export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { autoConnect = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Store callbacks in ref to avoid recreating them on every render
  const callbacksRef = useRef({
    onConnected: undefined as (() => void) | undefined,
    onDisconnected: undefined as (() => void) | undefined,
    onError: undefined as ((error: string) => void) | undefined,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onConnected: undefined,
      onDisconnected: undefined,
      onError: undefined,
    };
  }, []);

  /**
   * Initialize and connect to WebSocket server
   */
  const connect = useCallback(() => {
    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('✅ WebSocket already connected');
      return socketRef.current;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token') || '';
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8082';

      console.log('🔌 Connecting to WebSocket:', socketUrl);

      const newSocket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 3,
        transports: ['websocket'],
        closeOnBeforeunload: false,
        forceNew: false,
      });

      // Handle connection
      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected:', newSocket.id);
        setIsConnected(true);
        setSocketId(newSocket.id || null);
        callbacksRef.current.onConnected?.();
      });

      // Handle connection success event from server
      newSocket.on('connected', (data) => {
        console.log('✅ Socket initialized:', data);
      });

      // Handle disconnection
      newSocket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        setIsConnected(false);
        setSocketId(null);
        callbacksRef.current.onDisconnected?.();
      });

      // Handle errors
      newSocket.on('connect_error', (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        callbacksRef.current.onError?.(error.message || 'Connection error');
      });

      newSocket.on('error', (error: string) => {
        console.error('❌ WebSocket error:', error);
        callbacksRef.current.onError?.(error);
      });

      // Handle active connections stats
      newSocket.on('stats:active_connections', (data) => {
        console.log('👥 Active connections:', data.count);
      });

      socketRef.current = newSocket;
      return newSocket;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to connect to WebSocket:', errorMessage);
      callbacksRef.current.onError?.(errorMessage);
      return null;
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.off('connected');
        socketRef.current.off('stats:active_connections');
        socketRef.current.disconnect();
      } catch (error) {
        console.error('Error disconnecting socket:', error);
      }
      socketRef.current = null;
      setIsConnected(false);
      setSocketId(null);
      console.log('🔌 WebSocket disconnected');
    }
  }, []);

  /**
   * Subscribe to lead updates
   */
  const subscribeLead = useCallback((leadId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot subscribe to lead');
      return;
    }

    socketRef.current.emit('lead:subscribe', { leadId });
    console.log(`✅ Subscribed to lead: ${leadId}`);
  }, []);

  /**
   * Unsubscribe from lead updates
   */
  const unsubscribeLead = useCallback((leadId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot unsubscribe from lead');
      return;
    }

    socketRef.current.emit('lead:unsubscribe', { leadId });
    console.log(`✅ Unsubscribed from lead: ${leadId}`);
  }, []);

  /**
   * Listen to lead status changes
   */
  const onLeadStatusChanged = useCallback(
    (callback: (data: LeadStatusUpdate) => void) => {
      if (!socketRef.current) {
        console.warn('⚠️ Socket not initialized yet, cannot listen to lead:status_changed');
        return;
      }

      console.log('✅ Registering listener for lead:status_changed');

      const handler = (data: LeadStatusUpdate) => {
        console.log('📡 [EVENT] Lead status changed received:', data);
        callback(data);
      };

      socketRef.current.on('lead:status_changed', handler);

      // Return cleanup function
      return () => {
        console.log('🧹 Removing listener for lead:status_changed');
        socketRef.current?.off('lead:status_changed', handler);
      };
    },
    []
  );

  /**
   * Listen to call started events
   */
  const onCallStarted = useCallback(
    (callback: (data: CallStarted) => void) => {
      if (!socketRef.current) return;

      const handler = (data: CallStarted) => {
        console.log('📞 Call started:', data);
        callback(data);
      };

      socketRef.current.on('call:started', handler);

      return () => {
        socketRef.current?.off('call:started', handler);
      };
    },
    []
  );

  /**
   * Listen to call status updates
   */
  const onCallStatusUpdated = useCallback(
    (callback: (data: CallStatusUpdate) => void) => {
      if (!socketRef.current) {
        console.warn('⚠️ Socket not initialized yet, cannot listen to call:status_updated');
        return;
      }

      console.log('✅ Registering listener for call:status_updated');

      const handler = (data: CallStatusUpdate) => {
        console.log('📞 [EVENT] Call status updated received:', data);
        callback(data);
      };
 
      socketRef.current.on('call:status_updated', handler);

      return () => {
        console.log('🧹 Removing listener for call:status_updated');
        socketRef.current?.off('call:status_updated', handler);
      };
    },
    []
  );

  /**
   * Listen to call completed events
   */
  const onCallCompleted = useCallback(
    (callback: (data: CallCompleted) => void) => {
      if (!socketRef.current) {
        console.warn('⚠️ Socket not initialized yet, cannot listen to call:completed');
        return;
      }

      console.log('✅ Registering listener for call:completed');

      const handler = (data: CallCompleted) => {
        console.log('✅ [EVENT] Call completed received:', data);
        callback(data);
      };

      socketRef.current.on('call:completed', handler);

      return () => {
        console.log('🧹 Removing listener for call:completed');
        socketRef.current?.off('call:completed', handler);
      };
    },
    []
  );

  /**
   * Request current call status for a lead
   */
  const requestCallStatus = useCallback((leadId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot request call status');
      return;
    }

    socketRef.current.emit('call:status_request', { leadId });
    console.log(`📡 Requested call status for lead: ${leadId}`);
  }, []);

  /**
   * Listen to call status response
   */
  const onCallStatusResponse = useCallback(
    (callback: (data: any) => void) => {
      if (!socketRef.current) return;

      const handler = (data: any) => {
        console.log('📞 Call status response:', data);
        callback(data);
      };

      socketRef.current.on('call:status_response', handler);

      return () => {
        socketRef.current?.off('call:status_response', handler);
      };
    },
    []
  );

  // Acknowledge receipt of real-time update
  const acknowledgeStatusUpdate = useCallback((leadId: string, callId: string, status: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot send acknowledgement');
      return;
    }

    socketRef.current.emit('call:status_ack', { leadId, callId, status });
    console.log(`✅ Acknowledged status update - Lead: ${leadId}, Status: ${status}`);
  }, []);

   // Auto-connect on mount (only once, never on dependency changes)
  useEffect(() => {
    if (autoConnect && !socketRef.current) {
      connect();
    }

    return () => {
      if (socketRef.current?.connected) {
        disconnect();
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // 🔥 CRITICAL: Memoize return object so it doesn't change on every render
  // This was causing WebSocketProvider's useMemo to recalculate on every render
  // which caused child components to re-render and re-register listeners infinitely
  return useMemo(() => ({
    socket: socketRef.current,
    isConnected,
    socketId,
    connect,
    disconnect,
    subscribeLead,
    unsubscribeLead,
    onLeadStatusChanged,
    onCallStarted,
    onCallStatusUpdated,
    onCallCompleted,
    requestCallStatus,
    onCallStatusResponse,
    acknowledgeStatusUpdate,
  }), [
    isConnected,
    socketId,
    connect,
    disconnect,
    subscribeLead,
    unsubscribeLead,
    onLeadStatusChanged,
    onCallStarted,
    onCallStatusUpdated,
    onCallCompleted,
    requestCallStatus,
    onCallStatusResponse,
    acknowledgeStatusUpdate,
  ]);
};

export default useWebSocket;
