import axiosInstance from './auth-api';

export interface LeadSummary {
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  conversionRate: number;
  recentLeads: number;
  totalSiteVisits: number;
}

export interface LeadsBreakdown {
  byType: {
    hot: number;
    cold: number;
    pending: number;
    connected: number;
    fake: number;
  };
  byCallStatus: Record<string, number>;
  siteVisits: Record<string, number>;
}

export interface LeadDetail {
  _id: string;
  full_name: string;
  contact_number: string;
  lead_type: 'hot' | 'cold' | 'pending' | 'connected' | 'fake';
  call_status: 'pending' | 'connected' | 'not_connected' | 'callback' | 'completed';
  project_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadsDashboardStats {
  summary: LeadSummary;
  breakdown: LeadsBreakdown;
  leads: LeadDetail[];
}

export interface FilteredLeadsResponse {
  total: number;
  leads: LeadDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Get complete leads dashboard statistics
 * GET /api/leads/dashboard
 * Returns: summary counts, breakdown by type/status, all leads list, site visits count
 */
export async function getLeadsDashboardStats(): Promise<ApiResponse<LeadsDashboardStats>> {
  const response = await axiosInstance.get('/leads/dashboard');
  return response.data;
}

/**
 * Get leads with filters
 * POST /api/leads/dashboard/filtered
 * Filters: { leadType?: string, callStatus?: string, dateRange?: string }
 */
export async function getFilteredLeads(filters?: {
  leadType?: 'hot' | 'cold' | 'pending' | 'connected' | 'fake' | 'all';
  callStatus?: 'pending' | 'connected' | 'not_connected' | 'callback' | 'completed' | 'all';
  dateRange?: 'today' | 'week' | 'month' | '3months' | 'all';
}): Promise<ApiResponse<FilteredLeadsResponse>> {
  const response = await axiosInstance.post('/leads/dashboard/filtered', filters || {});
  return response.data;
}
