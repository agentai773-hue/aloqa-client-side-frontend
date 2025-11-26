import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  checkLeadExists,
  importLeads,
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
} from '@/api/leads-api';

const LEADS_QUERY_KEY = ['leads'];

// Hook to fetch all leads for current user
export function useLeads() {
  return useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: getAllLeads,
    select: (data) => data.data || [],
  });
}

// Hook to fetch single lead by ID
export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLeadById(id!),
    enabled: !!id,
    select: (data) => data.data,
  });
}

// Hook to check if lead exists
export function useCheckLeadExists(contactNumber: string | null) {
  return useQuery({
    queryKey: ['checkLead', contactNumber],
    queryFn: () => checkLeadExists(contactNumber!),
    enabled: !!contactNumber,
    select: (data) => data.exists,
  });
}

// Hook to create lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadData: CreateLeadRequest) => createLead(leadData),
    onSuccess: (data) => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

// Hook to update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      updateLead(id, data),
    onSuccess: () => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

// Hook to delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

// Hook to import leads
export function useImportLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadsData: CreateLeadRequest[]) => importLeads(leadsData),
    onSuccess: () => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}
