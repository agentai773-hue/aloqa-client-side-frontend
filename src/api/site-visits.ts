import api from '@/utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * API Call Functions
 */

export const siteVisitAPI = {
  // Create new site visit
  createSiteVisit: async (data: {
    leadId: string;
    visitDate: string;
    visitTime: string;
    projectName: string;
    siteExecutiveId?: string;
    address?: string;
    notes?: string;
    status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  }) => {
    const response = await api.post('/client-site-visits', data);
    return response.data;
  },

  // Get all site visits for a lead
  getLeadSiteVisits: async (leadId: string) => {
    const response = await api.get(`/client-site-visits/lead/${leadId}`);
    return response.data;
  },

  // Get upcoming site visits for a lead
  getUpcomingSiteVisits: async (leadId: string) => {
    const response = await api.get(`/client-site-visits/lead/${leadId}/upcoming`);
    return response.data;
  },

  // Get completed site visits for a lead
  getCompletedSiteVisits: async (leadId: string) => {
    const response = await api.get(`/client-site-visits/lead/${leadId}/completed`);
    return response.data;
  },

  // Get specific site visit by ID
  getSiteVisitById: async (id: string) => {
    const response = await api.get(`/client-site-visits/${id}`);
    return response.data;
  },

  // Update site visit
  updateSiteVisit: async (
    id: string,
    data: {
      visitDate?: string;
      visitTime?: string;
      projectName?: string;
      siteExecutiveId?: string;
      address?: string;
      notes?: string;
      status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    }
  ) => {
    const response = await api.put(`/client-site-visits/${id}`, data);
    return response.data;
  },

  // Delete site visit
  deleteSiteVisit: async (id: string) => {
    const response = await api.delete(`/client-site-visits/${id}`);
    return response.data;
  },

  // Extract site visit from transcript
  extractSiteVisitFromTranscript: async (data: {
    leadId: string;
    callHistoryId: string;
    transcript: string;
  }) => {
    const response = await api.post('/client-site-visits/extract/transcript', data);
    return response.data;
  },
};

/**
 * React Query Hooks
 */

// Hook for fetching all site visits for a lead
export const useSiteVisits = (leadId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['siteVisits', leadId],
    queryFn: () => siteVisitAPI.getLeadSiteVisits(leadId!),
    enabled: enabled && !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching upcoming site visits for a lead
export const useUpcomingSiteVisits = (leadId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['upcomingSiteVisits', leadId],
    queryFn: () => siteVisitAPI.getUpcomingSiteVisits(leadId!),
    enabled: enabled && !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching completed site visits for a lead
export const useCompletedSiteVisits = (leadId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['completedSiteVisits', leadId],
    queryFn: () => siteVisitAPI.getCompletedSiteVisits(leadId!),
    enabled: enabled && !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching specific site visit
export const useSiteVisit = (id: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['siteVisit', id],
    queryFn: () => siteVisitAPI.getSiteVisitById(id!),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating site visit
export const useCreateSiteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof siteVisitAPI.createSiteVisit>[0]) =>
      siteVisitAPI.createSiteVisit(data),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['siteVisits'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingSiteVisits'] });
    },
  });
};

// Hook for updating site visit
export const useUpdateSiteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof siteVisitAPI.updateSiteVisit>[1] }) =>
      siteVisitAPI.updateSiteVisit(id, data),
    onSuccess: (data, { id }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['siteVisit', id] });
      queryClient.invalidateQueries({ queryKey: ['siteVisits'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingSiteVisits'] });
      queryClient.invalidateQueries({ queryKey: ['completedSiteVisits'] });
    },
  });
};

// Hook for deleting site visit
export const useDeleteSiteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => siteVisitAPI.deleteSiteVisit(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['siteVisits'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingSiteVisits'] });
      queryClient.invalidateQueries({ queryKey: ['completedSiteVisits'] });
    },
  });
};

// Hook for extracting site visit from transcript
export const useExtractSiteVisitFromTranscript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof siteVisitAPI.extractSiteVisitFromTranscript>[0]) =>
      siteVisitAPI.extractSiteVisitFromTranscript(data),
    onSuccess: (data) => {
      if (data.success && data.data?.leadId) {
        // Invalidate site visits for the affected lead
        queryClient.invalidateQueries({ queryKey: ['siteVisits', data.data.leadId] });
        queryClient.invalidateQueries({ queryKey: ['upcomingSiteVisits', data.data.leadId] });
      }
    },
  });
};
