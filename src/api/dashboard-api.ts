import axiosInstance from './auth-api';

export interface DashboardStats {
  leads: {
    total: number;
    byType: Record<string, number>;
    byCallStatus: Record<string, number>;
  };
  callHistory: {
    total: number;
    successful: number;
    successRate: number;
    byStatus: Record<string, number>;
    recent: number; // Last 7 days
  };
  assistants: {
    total: number;
    active: number;
    inactive: number;
  };
  callDuration: {
    totalSeconds: number;
    totalMinutes: number;
    remainingSeconds: number;
    formatted: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Get complete dashboard statistics with all counts
 * GET /api/client-dashboard
 * Returns: All counts (leads, call history, assistants, total minutes) in one response
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await axiosInstance.get('/client-dashboard');
  return response.data;
}
