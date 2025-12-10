import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Lead, leadsAPI } from '@/api/leads';

export interface SearchLeadsParams {
  searchTerm: string;
  page?: number;
  pageSize?: number;
  leadType?: string;
  callStatus?: string;
  dateRange?: string;
}

export interface SearchLeadsResponse {
  success: boolean;
  data?: Lead[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

/**
 * Custom hook for searching leads with React Query
 * @param searchTerm - Search term to filter by (name, phone, or project)
 * @param page - Current page (default: 1)
 * @param pageSize - Results per page (default: 10)
 * @param leadType - Lead type filter ('all' or specific type)
 * @param callStatus - Call status filter ('all' or specific status)
 * @param dateRange - Date range filter ('all', 'today', 'yesterday', 'last_week', 'last_month')
 * @param enabled - Whether the query should run (default: true when filters are active)
 * @returns Query result with data, pagination, loading state, and error handling
 */
export const useSearchLeads = (
  searchTerm: string = '',
  page: number = 1,
  pageSize: number = 10,
  leadType: string = 'all',
  callStatus: string = 'all',
  dateRange: string = 'all',
  enabled: boolean = true
): UseQueryResult<SearchLeadsResponse, Error> => {
  return useQuery({
    queryKey: ['leadsSearch', searchTerm, page, pageSize, leadType, callStatus, dateRange],
    queryFn: async () => {
      const result = await leadsAPI.getAll({
        page,
        limit: pageSize,
        search: searchTerm,
        leadType: leadType !== 'all' ? leadType : undefined,
        status: callStatus !== 'all' ? callStatus : undefined
      });
      if (!result.success) {
        throw new Error(result.message || 'Failed to search leads');
      }
      
      // Convert to expected format
      const searchResponse: SearchLeadsResponse = {
        success: result.success,
        data: result.data.leads,
        pagination: {
          total: result.data.total,
          page: result.data.page,
          pageSize: result.data.limit,
          totalPages: result.data.totalPages
        },
        message: result.message
      };
      
      return searchResponse;
    },
    enabled: enabled, // Filters should work regardless of searchTerm
    staleTime: 0, // Always fresh data for search
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default useSearchLeads;
