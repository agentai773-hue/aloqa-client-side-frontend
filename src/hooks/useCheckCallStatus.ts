'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkCallStatus, CallStatusResponse, ApiResponse } from '@/api/call-status-api';

export function useCheckCallStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: string) => {
      const response = await checkCallStatus(callId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to check call status');
      }
      return response.data;
    },
    onSuccess: (data: CallStatusResponse | undefined) => {
      // Invalidate call history queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
      
      // Invalidate search call history queries
      queryClient.invalidateQueries({ queryKey: ['searchCallHistory'] });
      
      // If call status is completed, invalidate leads query
      if (data?.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      }
    },
    onError: (error: Error) => {
      console.error('Error checking call status:', error.message);
    },
  });
}
