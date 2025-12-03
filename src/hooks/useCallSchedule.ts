import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getScheduledCall,
  rescheduleCall,
  cancelScheduledCall,
} from '@/api/scheduled-calls';

export function useCallSchedule(leadId: string | null) {
  const queryClient = useQueryClient();

  // Query for getting scheduled call
  const scheduledCallQuery = useQuery({
    queryKey: ['scheduledCall', leadId],
    queryFn: () => getScheduledCall(leadId!),
    enabled: !!leadId,
    retry: 1,
  });

  // Mutation for rescheduling call
  const rescheduleMutation = useMutation({
    mutationFn: ({
      scheduledTime,
      reason,
    }: {
      scheduledTime: Date | string;
      reason?: string;
    }) => rescheduleCall(leadId!, scheduledTime, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledCall', leadId] });
    },
  });

  // Mutation for cancelling scheduled call
  const cancelMutation = useMutation({
    mutationFn: () => cancelScheduledCall(leadId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledCall', leadId] });
    },
  });

  return {
    scheduledCall: scheduledCallQuery.data?.data,
    isLoading: scheduledCallQuery.isLoading,
    error: scheduledCallQuery.error,

    reschedule: rescheduleMutation.mutate,
    rescheduling: rescheduleMutation.isPending,
    rescheduleError: rescheduleMutation.error,

    cancel: cancelMutation.mutate,
    cancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,
  };
}
