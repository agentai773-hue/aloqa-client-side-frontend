import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  initiateCall, 
  initiateCustomCall, 
  InitiateCallResponse, 
  InitiateCustomCallRequest,
  getCallHistory,
  getCallHistoryByLead,
  getCallsWithRecordings,
  getCallDetails,
  CallHistoryResponse,
  CallHistoryRecord
} from '@/api/call';

/**
 * Hook to initiate a call to a lead by ID
 * Used in Leads page table
 */
export function useInitiateCall() {
  const queryClient = useQueryClient();
  
  return useMutation<
    InitiateCallResponse,
    Error,
    { leadId: string }
  >({
    mutationFn: async (variables) => {
      const response = await initiateCall(variables.leadId);
      
      // If API returns success: false, throw an error
      if (!response.success) {
        throw new Error(response.message || 'Failed to initiate call');
      }
      
      return response;
    },
    onSuccess: (data) => {
      // Invalidate leads queries so frontend sees updated call status
      console.log('✅ [useInitiateCall] Call initiated successfully - invalidating queries');
      console.log('📊 Response:', data);
      
      // Invalidate with 'all' to force refetch immediately
      queryClient.invalidateQueries({ 
        queryKey: ['leads'],
        refetchType: 'all'
      });
      console.log('✅ [useInitiateCall] Invalidated [leads] query with refetchType=all');
      
      queryClient.invalidateQueries({ 
        queryKey: ['leadsSearch'],
        refetchType: 'all'
      });
      console.log('✅ [useInitiateCall] Invalidated [leadsSearch] query with refetchType=all');
    },
    onError: (error: any) => {
      console.error('Call initiation error:', error);
    }
  });
}

/**
 * Hook to initiate a call with custom data
 * Used in Make Call form
 */
export function useInitiateCustomCall() {
  const queryClient = useQueryClient();
  
  return useMutation<
    InitiateCallResponse,
    Error,
    InitiateCustomCallRequest
  >({
    mutationFn: async (callData) => {
      const response = await initiateCustomCall(callData);
      
      // If API returns success: false, throw an error
      if (!response.success) {
        throw new Error(response.message || 'Failed to initiate call');
      }
      
      return response;
    },
    onSuccess: (data) => {
      // Invalidate leads queries so frontend sees updated call status
      console.log('✅ [useInitiateCustomCall] Custom call initiated successfully - invalidating queries');
      console.log('📊 Response:', data);
      
      // Invalidate with 'all' to force refetch immediately
      queryClient.invalidateQueries({ 
        queryKey: ['leads'],
        refetchType: 'all'
      });
      console.log('✅ [useInitiateCustomCall] Invalidated [leads] query with refetchType=all');
      
      queryClient.invalidateQueries({ 
        queryKey: ['leadsSearch'],
        refetchType: 'all'
      });
      console.log('✅ [useInitiateCustomCall] Invalidated [leadsSearch] query with refetchType=all');
    },
    onError: (error: any) => {
      console.error('Custom call initiation error:', error);
    }
  });
}

/**
 * Hook to fetch call history with pagination
 */
export function useCallHistory(page: number = 1, pageSize: number = 10) {
  return useQuery<CallHistoryResponse>({
    queryKey: ['callHistory', page, pageSize],
    queryFn: async () => {
      const response = await getCallHistory(page, pageSize);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch call history');
      }
      return response;
    },
  });
}

/**
 * Hook to fetch call history for a specific lead
 */
export function useCallHistoryByLead(leadId: string | null) {
  return useQuery<CallHistoryResponse>({
    queryKey: ['callHistoryByLead', leadId],
    queryFn: async () => {
      if (!leadId) {
        return { success: true, data: [] };
      }
      const response = await getCallHistoryByLead(leadId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch lead call history');
      }
      return response;
    },
    enabled: !!leadId,
  });
}

/**
 * Hook to fetch calls with recordings
 */
export function useCallsWithRecordings() {
  return useQuery<CallHistoryResponse>({
    queryKey: ['callsWithRecordings'],
    queryFn: async () => {
      const response = await getCallsWithRecordings();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch calls with recordings');
      }
      return response;
    },
  });
}

/**
 * Hook to fetch call details
 */
export function useCallDetails(callId: string | null) {
  return useQuery<CallHistoryResponse>({
    queryKey: ['callDetails', callId],
    queryFn: async () => {
      if (!callId) {
        return { success: true, data: undefined };
      }
      const response = await getCallDetails(callId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch call details');
      }
      return response;
    },
    enabled: !!callId,
  });
}
