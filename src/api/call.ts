import axiosInstance from '@/utils/api';

export interface InitiateCallRequest {
  leadId: string;
}

export interface InitiateCustomCallRequest {
  customerName: string;
  projectName: string;
  recipientPhoneNumber: string;
  assistantId: string;
}

export interface CallData {
  call_id: string;
  status: string;
  lead_name?: string;
  customer_name?: string;
  phone_number: string;
}

export interface InitiateCallResponse {
  success: boolean;
  message: string;
  data?: CallData;
  statusCode?: number;
}

export interface CallHistoryRecord {
  _id: string;
  userId: string;
  leadId?: string;
  agentId: string;
  recipientPhoneNumber: string;
  callerName?: string;
  status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed' | 'cancelled';
  callDuration: number;
  recordingUrl?: string;
  recordingId?: string;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
  executionDetails?: {
    transcript?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow any other fields from API
}

export interface CallHistoryResponse {
  success: boolean;
  data?: CallHistoryRecord[] | CallHistoryRecord;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * Initiate a call to a lead via Bolna AI
 * @param leadId - The ID of the lead to call
 * @returns Response with call details
 */
export async function initiateCall(
  leadId: string
): Promise<InitiateCallResponse> {
  try {
    const response = await axiosInstance.post<InitiateCallResponse>(
      '/client-call/initiate',
      { leadId }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error initiating call:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to initiate call',
      statusCode: error.response?.status || 500
    };
  }
}

/**
 * Initiate a call with custom data (from Make Call form)
 * @param callData - Customer name, project name, phone number, and assistant ID
 * @returns Response with call details
 */
export async function initiateCustomCall(
  callData: InitiateCustomCallRequest
): Promise<InitiateCallResponse> {
  try {
    const response = await axiosInstance.post<InitiateCallResponse>(
      '/client-call/initiate-custom',
      callData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error initiating custom call:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to initiate call',
      statusCode: error.response?.status || 500
    };
  }
}

/**
 * Get all call history for logged-in user with optional filters
 * @param page - Page number (default: 1)
 * @param pageSize - Records per page (default: 10)
 * @param status - Status filter ('all' or specific status)
 * @param assistantId - Assistant ID filter ('all' or specific assistant ID)
 * @returns Response with call history records and pagination
 */
export async function getCallHistoryWithFilters(
  page: number = 1,
  pageSize: number = 10,
  status: string = 'all',
  assistantId: string = 'all'
): Promise<CallHistoryResponse> {
  try {
    const response = await axiosInstance.get<CallHistoryResponse>(
      '/client-call/call-history',
      {
        params: { page, pageSize, status, assistantId }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching call history with filters:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch call history'
    };
  }
}

/**
 * Get all call history for logged-in user
 * @param page - Page number (default: 1)
 * @param pageSize - Records per page (default: 10)
 * @returns Response with call history records and pagination
 */
export async function getCallHistory(
  page: number = 1,
  pageSize: number = 10
): Promise<CallHistoryResponse> {
  try {
    const response = await axiosInstance.get<CallHistoryResponse>(
      '/client-call/call-history',
      {
        params: { page, pageSize }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching call history:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch call history'
    };
  }
}

/**
 * Get call history for a specific lead
 * @param leadId - The ID of the lead
 * @returns Response with call history records for that lead
 */
export async function getCallHistoryByLead(
  leadId: string
): Promise<CallHistoryResponse> {
  try {
    const response = await axiosInstance.get<CallHistoryResponse>(
      `/client-call/call-history/lead/${leadId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching lead call history:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch lead call history'
    };
  }
}

/**
 * Get all calls with recordings
 * @returns Response with call records that have recordings
 */
export async function getCallsWithRecordings(): Promise<CallHistoryResponse> {
  try {
    const response = await axiosInstance.get<CallHistoryResponse>(
      '/client-call/call-history/recordings'
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching calls with recordings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch calls with recordings'
    };
  }
}

/**
 * Get details of a specific call
 * @param callId - The Bolna call ID
 * @returns Response with call details
 */
export async function getCallDetails(
  callId: string
): Promise<CallHistoryResponse> {
  try {
    const response = await axiosInstance.get<CallHistoryResponse>(
      `/client-call/call-history/details/${callId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching call details:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch call details'
    };
  }
}

/**
 * Search call history by callerName, recipientPhoneNumber, or projectName with optional filters
 * @param searchTerm - The search term to filter by (name, phone, or project)
 * @param page - Page number (default: 1)
 * @param pageSize - Records per page (default: 10)
 * @param status - Status filter ('all' or specific status)
 * @param assistantId - Assistant ID filter ('all' or specific assistant ID)
 * @returns Response with filtered call history records and pagination
 */
export async function searchCallHistory(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 10,
  status: string = 'all',
  assistantId: string = 'all'
): Promise<CallHistoryResponse> {
  try {
    const response = await axiosInstance.post<CallHistoryResponse>(
      '/client-call/call-history/search',
      { 
        searchTerm: searchTerm.trim(), 
        page, 
        pageSize,
        status,
        assistantId
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error searching call history:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to search call history'
    };
  }
}
