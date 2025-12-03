import authApi from './auth-api';

/**
 * Get scheduled call for a lead
 */
export const getScheduledCall = async (leadId: string) => {
  const { data } = await authApi.get(`/client-calls/scheduled-call/${leadId}`);
  return data;
};

/**
 * Reschedule a call
 */
export const rescheduleCall = async (
  leadId: string,
  scheduledTime: Date | string,
  reason?: string
) => {
  const { data } = await authApi.post(
    `/client-calls/scheduled-call/${leadId}/reschedule`,
    {
      scheduledTime,
      reason,
    }
  );
  return data;
};

/**
 * Cancel a scheduled call
 */
export const cancelScheduledCall = async (leadId: string) => {
  const { data } = await authApi.post(
    `/client-calls/scheduled-call/${leadId}/cancel`
  );
  return data;
};
