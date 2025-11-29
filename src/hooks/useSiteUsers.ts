import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSiteUser,
  getAllSiteUsers,
  getSiteUserById,
  updateSiteUser,
  deleteSiteUser,
  deactivateSiteUser,
  activateSiteUser,
  CreateSiteUserData,
  UpdateSiteUserData,
  SiteUser,
} from '@/api/site-users';

// Get all site users
export const useSiteUsers = (filters?: { is_active?: boolean }) => {
  return useQuery({
    queryKey: ['site-users', filters],
    queryFn: () => getAllSiteUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single site user
export const useSiteUser = (id: string) => {
  return useQuery({
    queryKey: ['site-user', id],
    queryFn: () => getSiteUserById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

// Create site user mutation
export const useCreateSiteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSiteUserData) => createSiteUser(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['site-users'] });
    },
    onError: (error: any) => {
      console.error('Error creating site user:', error);
    },
  });
};

// Update site user mutation
export const useUpdateSiteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteUserData }) =>
      updateSiteUser(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['site-users'] });
      queryClient.invalidateQueries({ queryKey: ['site-user', id] });
    },
    onError: (error: any) => {
      console.error('Error updating site user:', error);
    },
  });
};

// Delete site user mutation
export const useDeleteSiteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSiteUser(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['site-users'] });
    },
    onError: (error: any) => {
      console.error('Error deleting site user:', error);
    },
  });
};

// Deactivate site user mutation
export const useDeactivateSiteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateSiteUser(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['site-users'] });
    },
    onError: (error: any) => {
      console.error('Error deactivating site user:', error);
    },
  });
};

// Activate site user mutation
export const useActivateSiteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateSiteUser(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['site-users'] });
    },
    onError: (error: any) => {
      console.error('Error activating site user:', error);
    },
  });
};
