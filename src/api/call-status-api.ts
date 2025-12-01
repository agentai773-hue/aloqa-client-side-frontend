import axiosInstance from './auth-api';

export interface CallStatusResponse {
  _id: string;
  callId?: string;
  status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed' | 'cancelled' | 'queued' | 'in_progress';
  callerName?: string;
  recipientPhoneNumber: string;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
  recordingUrl?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Check call status and get latest call details
 * POST /client-call/call-history/check-status/:callId
 * @param callId - The ID of the call to check
 * @returns Updated call details with latest status
 */
export async function checkCallStatus(callId: string): Promise<ApiResponse<CallStatusResponse>> {
  const response = await axiosInstance.post(
    `/client-call/call-history/check-status/${callId}`,
    {}
  );
  return response.data;
}
