import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDashboardStats,
  DashboardStats,
} from '@/api/dashboard-api';

const DASHBOARD_QUERY_KEY = ['dashboard'];

/**
 * Hook to fetch complete dashboard statistics with all counts
 * Single API call that returns: leads, call history, assistants, and total minutes
 * @returns Query object with dashboard stats
 */
export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboardStats,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to refetch dashboard data manually
 * @returns Helper functions to refresh data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return {
    refreshDashboard: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
    refetchDashboard: () => {
      queryClient.refetchQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  };
}
