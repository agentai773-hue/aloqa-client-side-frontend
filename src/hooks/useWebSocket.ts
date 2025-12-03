import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { RootState } from '@/store/store';
import websocketService from '@/services/websocketService';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Initialize WebSocket when user is authenticated
    if (user?._id) {
      console.log('\n📡 [useWebSocket] Initializing WebSocket connection...');
      console.log(`   - userId: ${user._id}`);
      
      // Connect to WebSocket server
      websocketService.connect(user._id).then(() => {
        console.log('✅ [useWebSocket] WebSocket connected successfully');
        console.log(`   - Now listening for real-time updates from backend\n`);
        
        // Listen to call status updates
        websocketService.onCallStatusUpdated((data) => {
          console.log('\n🔔 [useWebSocket] REAL-TIME STATUS UPDATE RECEIVED:');
          console.log(`   - leadId: ${data.leadId}`);
          console.log(`   - status: ${data.status}`);
          console.log(`   - timestamp: ${data.timestamp}\n`);
          
          // Invalidate queries to force refetch
          console.log('   - Invalidating queries: [callHistory, leads, etc]');
          queryClient.invalidateQueries({ queryKey: ['callHistory'] });
          queryClient.invalidateQueries({ queryKey: ['searchCallHistory'] });
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          console.log('   - UI will update with fresh data\n');
        });

        // Listen to call rescheduled events
        websocketService.onCallRescheduled((data) => {
          console.log('📅 [useWebSocket] Call rescheduled:', data);
          queryClient.invalidateQueries({ queryKey: ['callHistory'] });
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        });

        // Listen to call cancelled events
        websocketService.onCallCancelled((data) => {
          console.log('❌ [useWebSocket] Call cancelled:', data);
          queryClient.invalidateQueries({ queryKey: ['callHistory'] });
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        });
      }).catch((error) => {
        console.error('❌ [useWebSocket] Connection failed:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      if (!user?._id) {
        console.log('✋ [useWebSocket] User logged out, cleaning up WebSocket');
        websocketService.removeAllListeners();
        // Don't disconnect - keep connection alive
      }
    };
  }, [user?._id, queryClient]);

  // Provide methods to trigger manual refetch
  const refetchCallHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['callHistory'] });
  }, [queryClient]);

  return {
    isConnected: websocketService.isConnected(),
    refetchCallHistory,
  };
}
