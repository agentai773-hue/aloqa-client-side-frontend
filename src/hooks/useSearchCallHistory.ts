import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { searchCallHistory } from '@/api/call';
import { CallHistoryRecord } from '@/api/call';

export interface SearchCallHistoryParams {
  searchTerm: string;
  page?: number;
  pageSize?: number;
  status?: string;
  assistantId?: string;
}

export interface SearchCallHistoryResponse {
  success: boolean;
  data?: CallHistoryRecord[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * Custom hook for searching call history with React Query
 * @param searchTerm - Search term to filter by (name, phone, or project)
 * @param page - Current page (default: 1)
 * @param pageSize - Results per page (default: 10)
 * @param status - Status filter ('all' or specific status)
 * @param assistantId - Assistant ID filter ('all' or specific assistant ID)
 * @param enabled - Whether the query should run (default: true when searchTerm is not empty)
 * @returns Query result with data, pagination, loading state, and error handling
 */
export const useSearchCallHistory = (
  searchTerm: string,
  page: number = 1,
  pageSize: number = 10,
  status: string = 'all',
  assistantId: string = 'all',
  enabled: boolean = true
): UseQueryResult<SearchCallHistoryResponse, Error> => {
  return useQuery({
    queryKey: ['callHistorySearch', searchTerm, page, pageSize, status, assistantId],
    queryFn: async () => {
      console.log('Searching with params:', { searchTerm, page, pageSize, status, assistantId });
      const result = await searchCallHistory(searchTerm, page, pageSize, status, assistantId);
      console.log('Search result:', result);
      if (!result.success) {
        throw new Error(result.message || 'Failed to search call history');
      }
      return result as SearchCallHistoryResponse;
    },
    enabled: enabled, // Filters should work regardless of searchTerm
    staleTime: 0, // Always fresh data for search
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
