import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLeadsDashboardStats,
  getFilteredLeads,
  LeadsDashboardStats,
  FilteredLeadsResponse,
} from '@/api/lead-dashboard-api';

const LEADS_DASHBOARD_QUERY_KEY = ['leadsDashboard'];
const FILTERED_LEADS_QUERY_KEY = ['filteredLeads'];

/**
 * Hook to fetch complete leads dashboard statistics
 * Returns: summary counts, breakdown by type/status, all leads list, site visits count
 * @returns Query object with leads dashboard stats
 */
export function useLeadsDashboard() {
  return useQuery({
    queryKey: LEADS_DASHBOARD_QUERY_KEY,
    queryFn: getLeadsDashboardStats,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch filtered leads
 * @param filters Filter options (leadType, callStatus, dateRange)
 * @returns Query object with filtered leads
 */
export function useFilteredLeads(filters?: {
  leadType?: 'hot' | 'cold' | 'pending' | 'connected' | 'fake' | 'all';
  callStatus?: 'pending' | 'connected' | 'not_connected' | 'callback' | 'completed' | 'all';
  dateRange?: 'today' | 'week' | 'month' | '3months' | 'all';
}) {
  return useQuery({
    queryKey: [...FILTERED_LEADS_QUERY_KEY, filters],
    queryFn: () => getFilteredLeads(filters),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to refresh leads dashboard data manually
 * @returns Helper functions to refresh/refetch data
 */
export function useRefreshLeadsDashboard() {
  const queryClient = useQueryClient();

  return {
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_DASHBOARD_QUERY_KEY });
    },
    refetchDashboard: () => {
      queryClient.refetchQueries({ queryKey: LEADS_DASHBOARD_QUERY_KEY });
    },
    invalidateFiltered: () => {
      queryClient.invalidateQueries({ queryKey: FILTERED_LEADS_QUERY_KEY });
    },
    refetchAll: () => {
      queryClient.refetchQueries({ queryKey: LEADS_DASHBOARD_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: FILTERED_LEADS_QUERY_KEY });
    },
  };
}
