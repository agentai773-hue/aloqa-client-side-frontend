import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsAPI } from '../api/leads';
import type { Lead } from '../api/leads';

const LEADS_QUERY_KEY = ['leads'];

export function useLeads(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  leadType?: string;
}) {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await leadsAPI.getAll(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch leads');
      }
      return response.data;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadData: Lead) => {
      const response = await leadsAPI.create(leadData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create lead');
      }
      return response.data?.leads[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await leadsAPI.getById(id);
      if (!response.success) {
        throw new Error(response.message || 'Lead not found');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Lead> & { _id: string }) => {
      const response = await leadsAPI.update(data._id, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update lead');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await leadsAPI.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete lead');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useImportLeads() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leads: Lead[]) => {
      const response = await leadsAPI.createBulk(leads);
      if (!response.success) {
        throw new Error(response.message || 'Failed to import leads');
      }
      return response.data?.leads || [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export type { Lead };
export default useLeads;
