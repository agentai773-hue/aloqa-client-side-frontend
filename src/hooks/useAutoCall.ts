import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startAutoCall, stopAutoCall, getAutoCallStatus } from '@/api/auto-call';

export function useAutoCall() {
  const queryClient = useQueryClient();

  // Query for auto-call status - check only on mount and manual refetch
  const statusQuery = useQuery({
    queryKey: ['autoCallStatus'],
    queryFn: getAutoCallStatus,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  // Mutation for starting auto-call
  const startMutation = useMutation({
    mutationFn: startAutoCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoCallStatus'] });
    }
  });

  // Mutation for stopping auto-call
  const stopMutation = useMutation({
    mutationFn: stopAutoCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoCallStatus'] });
    }
  });

  return {
    isRunning: statusQuery.data?.data?.isRunning || false,
    statusLoading: statusQuery.isLoading,
    statusError: statusQuery.error,
    
    startAutoCall: startMutation.mutate,
    startLoading: startMutation.isPending,
    startError: startMutation.error,
    
    stopAutoCall: stopMutation.mutate,
    stopLoading: stopMutation.isPending,
    stopError: stopMutation.error
  };
}
