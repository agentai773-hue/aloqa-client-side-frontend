import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private userId: string | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Extract base URL without /api suffix for WebSocket connection
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8082';
    // Remove /api suffix if present
    this.url = apiBaseUrl.replace(/\/api\/?$/, '') || 'http://localhost:8082';
    console.log('🔗 [WebSocketService] Connecting to:', this.url);
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 🔴 CHECK 1: If socket already exists (whether connected or not), reuse it
      if (this.socket) {
        if (this.socket.connected) {
          console.log('✅ [WebSocketService] Already connected:', this.socket?.id);
          resolve();
          return;
        } else {
          console.log('⏳ [WebSocketService] Socket exists but reconnecting, waiting for connection...');
          // Don't create new socket, wait for existing one to connect
          const checkConnection = setInterval(() => {
            if (this.socket?.connected) {
              clearInterval(checkConnection);
              resolve();
            }
          }, 100);
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkConnection);
            if (!this.socket?.connected) {
              reject(new Error('Connection timeout'));
            }
          }, 10000);
          return;
        }
      }

      try {
        this.userId = userId;
        console.log(`🔌 [WebSocketService] Attempting to connect to ${this.url}`);
        
        this.socket = io(this.url, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          timeout: 20000,
        });

        this.socket.on('connect', () => {
          console.log('✅ [WebSocketService] Connected successfully:', this.socket?.id);
          // Join user-specific room
          this.socket?.emit('join-user', userId);
          console.log(`📍 [WebSocketService] Emitted join-user for userId: ${userId}`);
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('❌ [WebSocketService] Disconnected:', reason);
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('❌ [WebSocketService] Connection error:', error?.message || error);
          // Don't reject on connect_error - socket will auto-reconnect
          // reject(error);
        });

        this.socket.on('error', (error: any) => {
          console.error('❌ [WebSocketService] Socket error:', error);
        });
      } catch (error) {
        console.error('❌ [WebSocketService] Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('✋ WebSocket disconnected');
    }
  }

  /**
   * Listen to call status updates (prevent duplicate listeners)
   */
  onCallStatusUpdated(
    callback: (data: {
      callId: string;
      status: string;
      leadId: string;
      leadType: string;
      timestamp: string;
    }) => void
  ): void {
    if (!this.socket) {
      console.warn('🚨 [WebSocketService] Socket not initialized yet, retrying listener setup');
      // Retry after a short delay
      setTimeout(() => {
        this.onCallStatusUpdated(callback);
      }, 500);
      return;
    }

    console.log('🔴 [WebSocketService] Setting up listener for call:status-updated');

    // Remove existing listener if any to prevent duplicates
    this.socket.off('call:status-updated');

    // Add new listener with logging
    this.socket.on('call:status-updated', (data) => {
      console.log('🔴🔴🔴 [WebSocketService] GOT call:status-updated EVENT FROM BACKEND:');
      console.log('   - Raw Data:', JSON.stringify(data, null, 2));
      try {
        callback(data);
        console.log('✅ Callback executed successfully\n');
      } catch (error) {
        console.error('❌ Error in callback:', error);
      }
    });
    
    console.log('✅ [WebSocketService] Listener registered for call:status-updated\n');
  }

  /**
   * Listen to call rescheduled events
   */
  onCallRescheduled(
    callback: (data: {
      leadId: string;
      scheduledTime: string;
      reason: string;
      timestamp: string;
    }) => void
  ): void {
    if (!this.socket) {
      console.warn('🚨 [WebSocketService] Socket not initialized yet, retrying listener setup');
      // Retry after a short delay
      setTimeout(() => {
        this.onCallRescheduled(callback);
      }, 500);
      return;
    }

    // Remove existing listener if any
    this.socket.off('call:rescheduled');

    // Add new listener
    this.socket.on('call:rescheduled', callback);
  }

  /**
   * Listen to call cancelled events
   */
  onCallCancelled(
    callback: (data: {
      leadId: string;
      timestamp: string;
    }) => void
  ): void {
    if (!this.socket) {
      console.warn('🚨 [WebSocketService] Socket not initialized yet, retrying listener setup');
      // Retry after a short delay
      setTimeout(() => {
        this.onCallCancelled(callback);
      }, 500);
      return;
    }

    // Remove existing listener if any
    this.socket.off('call:cancelled');

    // Add new listener
    this.socket.on('call:cancelled', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.off('call:status-updated');
      this.socket.off('call:rescheduled');
      this.socket.off('call:cancelled');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
