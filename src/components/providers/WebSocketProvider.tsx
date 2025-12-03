'use client';

import React, { createContext, useContext, ReactNode, useRef, useEffect, useMemo } from 'react';
import useWebSocket from '@/hooks/useWebSocket';
import { Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
  subscribeLead: (leadId: string) => void;
  unsubscribeLead: (leadId: string) => void;
  onLeadStatusChanged: (callback: (data: any) => void) => (() => void) | undefined;
  onCallStarted: (callback: (data: any) => void) => (() => void) | undefined;
  onCallStatusUpdated: (callback: (data: any) => void) => (() => void) | undefined;
  onCallCompleted: (callback: (data: any) => void) => (() => void) | undefined;
  requestCallStatus: (leadId: string) => void;
  onCallStatusResponse: (callback: (data: any) => void) => (() => void) | undefined;
  acknowledgeStatusUpdate: (leadId: string, callId: string, status: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const loggingRef = useRef(false);
  
  const {
    socket,
    isConnected,
    socketId,
    subscribeLead,
    unsubscribeLead,
    onLeadStatusChanged,
    onCallStarted,
    onCallStatusUpdated,
    onCallCompleted,
    requestCallStatus,
    onCallStatusResponse,
    acknowledgeStatusUpdate,
  } = useWebSocket({
    autoConnect: true,
  });

  // Log connection status change (using ref to prevent re-renders)
  useEffect(() => {
    if (isConnected && !loggingRef.current) {
      loggingRef.current = true;
      console.log('✅ WebSocket Provider connected');
      // Expose socket globally for emitting events
      (window as any).__socket = socket;
    } else if (!isConnected && loggingRef.current) {
      loggingRef.current = false;
      console.log('🔌 WebSocket Provider disconnected');
      (window as any).__socket = null;
    }
  }, [isConnected, socket]);

  // 🔥 CRITICAL FIX: Use useMemo to prevent context value from changing on every render
  // This was causing child components to re-render and re-register WebSocket listeners infinitely
  const value: WebSocketContextType = useMemo(() => ({
    socket,
    isConnected,
    socketId,
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
    socket,
    isConnected,
    socketId,
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

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook to use WebSocket context
 * Throws error if used outside of WebSocketProvider
 */
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;
