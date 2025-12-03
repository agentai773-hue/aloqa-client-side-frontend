import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketContext } from '@/components/providers/WebSocketProvider';

// Module-level state to survive component remounts
let listenersRegistered = false;

/**
 * Map WebSocket/Bolna status to valid Lead call_status
 * Converts intermediate statuses to proper enum values
 */
function mapStatusToLeadStatus(status: string): string {
  // Map various status values to valid Lead call_status enum values
  const statusMap: { [key: string]: string } = {
    'call_started': 'connected',        // Call initiated
    'initiated': 'connected',            // Call being initiated
    'ringing': 'connected',              // Phone ringing
    'in-progress': 'connected',          // Call in progress
    'connected': 'connected',            // Call connected
    'call-disconnected': 'completed',    // Call disconnected/ended
    'completed': 'completed',            // Call completed
    'failed': 'not_connected',           // Call failed
    'failed-invalid': 'not_connected',   // Invalid number
    'busy': 'busy',                      // Busy signal
    'callback': 'callback',              // Callback scheduled
    'pending': 'pending',                // Pending call
    'scheduled': 'scheduled'             // Scheduled call
  };
  
  return statusMap[status] || status; // Return mapped value or original if not found
}

/**
 * Hook to register WebSocket listeners globally
 * Survives Fast Refresh cycles and component remounts
 * IMPORTANT: Does NOT cleanup on unmount to keep listeners alive
 */
export function useWebSocketListeners() {
  const queryClient = useQueryClient();
  const { onLeadStatusChanged, onCallStatusUpdated, onCallCompleted } = useWebSocketContext();
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent double registration due to React.StrictMode or remounts
    if (hasRunRef.current || listenersRegistered) {
      console.log('✅ WebSocket listeners already registered - skipping registration');
      return;
    }

    hasRunRef.current = true;
    console.log('📡 Registering WebSocket listeners globally...');
    listenersRegistered = true;

    // Register listeners - NEVER call the cleanup functions returned!
    // We intentionally ignore the cleanup functions to keep listeners alive
    onLeadStatusChanged((data: any) => {
      console.log('📡 Lead status changed - updating locally', data);
      
      // Update the ['leads'] cache
      queryClient.setQueryData(['leads'], (oldData: any) => {
        if (!oldData) {
          console.warn('⚠️ leads cache is empty, skipping update');
          return oldData;
        }
        
        // Handle both direct array and API response object
        if (Array.isArray(oldData)) {
          // Direct array format
          return oldData.map((lead: any) => 
            lead._id === data.leadId 
              ? { ...lead, ...data.data, call_status: data.data?.call_status || lead.call_status }
              : lead
          );
        } else if (oldData.data && Array.isArray(oldData.data)) {
          // API response format: {success, data: [...], message}
          return {
            ...oldData,
            data: oldData.data.map((lead: any) => 
              lead._id === data.leadId 
                ? { ...lead, ...data.data, call_status: data.data?.call_status || lead.call_status }
                : lead
            )
          };
        }
        
        console.warn('⚠️ leads cache has unexpected format, skipping update:', oldData);
        return oldData;
      });
      
      // Also update all leadsSearch caches (for search queries)
      queryClient.setQueriesData(
        { queryKey: ['leadsSearch'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Check if it's a search response object with data property
          if (oldData.data && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((lead: any) => 
                lead._id === data.leadId 
                  ? { ...lead, ...data.data, call_status: data.data?.call_status || lead.call_status }
                  : lead
              )
            };
          }
          
          // Check if it's directly an array (fallback)
          if (Array.isArray(oldData)) {
            return oldData.map((lead: any) => 
              lead._id === data.leadId 
                ? { ...lead, ...data.data, call_status: data.data?.call_status || lead.call_status }
                : lead
            );
          }
          
          return oldData;
        }
      );
      
      console.log(`📡 Cache update complete for lead ${data.leadId}`);
    });

    onCallStatusUpdated((data: any) => {
      console.log('📞 Call status updated - updating locally', data);
      
      // Map the status to valid Lead call_status
      const mappedStatus = mapStatusToLeadStatus(data.status);
      console.log(`📊 Status mapping: "${data.status}" → "${mappedStatus}"`);
      
      // Update the ['leads'] cache first
      queryClient.setQueryData(['leads'], (oldData: any) => {
        if (!oldData) {
          console.warn('⚠️ leads cache is empty, skipping update');
          return oldData;
        }
        
        // Handle both direct array and API response object
        if (Array.isArray(oldData)) {
          // Direct array format
          const updated = oldData.map((lead: any) => 
            lead._id === data.leadId 
              ? { ...lead, call_status: mappedStatus }
              : lead
          );
          console.log(`✅ Updated ['leads'] cache for lead ${data.leadId}`);
          return updated;
        } else if (oldData.data && Array.isArray(oldData.data)) {
          // API response format: {success, data: [...], message}
          const updated = {
            ...oldData,
            data: oldData.data.map((lead: any) => 
              lead._id === data.leadId 
                ? { ...lead, call_status: mappedStatus }
                : lead
            )
          };
          console.log(`✅ Updated ['leads'] cache (API format) for lead ${data.leadId}`);
          return updated;
        }
        
        console.warn('⚠️ leads cache has unexpected format, skipping update:', oldData);
        return oldData;
      });
      
      // Update ALL leadsSearch caches (all search queries with different params)
      // This is critical for the leads page to update when filters are active
      queryClient.setQueriesData(
        { queryKey: ['leadsSearch'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Check if it's a search response object with data property
          if (oldData.data && Array.isArray(oldData.data)) {
            const updated = {
              ...oldData,
              data: oldData.data.map((lead: any) => 
                lead._id === data.leadId 
                  ? { ...lead, call_status: mappedStatus }
                  : lead
              )
            };
            console.log(`✅ Updated ['leadsSearch'] cache for lead ${data.leadId}`);
            return updated;
          }
          
          // Check if it's directly an array (fallback)
          if (Array.isArray(oldData)) {
            const updated = oldData.map((lead: any) => 
              lead._id === data.leadId 
                ? { ...lead, call_status: mappedStatus }
                : lead
            );
            console.log(`✅ Updated ['leadsSearch'] cache (array format) for lead ${data.leadId}`);
            return updated;
          }
          
          console.warn('⚠️ leadsSearch cache has unexpected format:', oldData);
          return oldData;
        }
      );
      
      // IMPORTANT: DO NOT invalidate queries - we already updated the cache directly
      // Invalidation causes a refetch which can race with our cache update
      // Instead, just notify subscribers about the data change
      // React Query will automatically trigger re-renders for components using affected queries
      console.log(`📡 Cache update complete for lead ${data.leadId} with status ${mappedStatus}`);
    });

    onCallCompleted((data: any) => {
      console.log('✅ Call completed - updating locally', data);
      
      // Update the ['leads'] cache
      queryClient.setQueryData(['leads'], (oldData: any) => {
        if (!oldData) {
          console.warn('⚠️ leads cache is empty, skipping update');
          return oldData;
        }
        
        // Handle both direct array and API response object
        if (Array.isArray(oldData)) {
          // Direct array format
          return oldData.map((lead: any) => 
            lead._id === data.leadId 
              ? { ...lead, call_status: 'completed' }
              : lead
          );
        } else if (oldData.data && Array.isArray(oldData.data)) {
          // API response format: {success, data: [...], message}
          return {
            ...oldData,
            data: oldData.data.map((lead: any) => 
              lead._id === data.leadId 
                ? { ...lead, call_status: 'completed' }
                : lead
            )
          };
        }
        
        console.warn('⚠️ leads cache has unexpected format, skipping update:', oldData);
        return oldData;
      });
      
      // Also update all leadsSearch caches (for search queries)
      queryClient.setQueriesData(
        { queryKey: ['leadsSearch'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Check if it's a search response object with data property
          if (oldData.data && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((lead: any) => 
                lead._id === data.leadId 
                  ? { ...lead, call_status: 'completed' }
                  : lead
              )
            };
          }
          
          // Check if it's directly an array (fallback)
          if (Array.isArray(oldData)) {
            return oldData.map((lead: any) => 
              lead._id === data.leadId 
                ? { ...lead, call_status: 'completed' }
                : lead
            );
          }
          
          return oldData;
        }
      );
      
      console.log(`📡 Cache update complete for lead ${data.leadId} with final status completed`);
    });

    console.log('✅ WebSocket listeners registered! (Listeners are now PERSISTENT)');

    // NO cleanup function - keep listeners alive across component remounts
    // The listeners will stay registered on the socket permanently
    // and will survive page navigation
    return undefined;
  }, []); // Empty deps - run only once on first mount
}

