import api from '@/utils/api';


export interface SiteUser {
  _id: string;
  full_name: string;
  email: string;
  contact_number: string;
  project_name: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteUserData {
  full_name: string;
  email: string;
  contact_number: string;
  project_name: string;
  password: string;
}

export interface UpdateSiteUserData {
  full_name?: string;
  email?: string;
  contact_number?: string;
  project_name?: string;
  password?: string;
}

// Create site user
export const createSiteUser = async (data: CreateSiteUserData) => {
  const response = await api.post('/client-site-users', data);
  return response.data;
};

// Get all site users
export const getAllSiteUsers = async (filters?: { is_active?: boolean }) => {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined) {
    params.append('is_active', String(filters.is_active));
  }

  const queryString = params.toString();
  const url = queryString ? `/client-site-users?${queryString}` : '/client-site-users';

  const response = await api.get(url);
  return response.data;
};

// Get single site user
export const getSiteUserById = async (id: string) => {
  const response = await api.get(`/client-site-users/${id}`);
  return response.data;
};

// Update site user
export const updateSiteUser = async (id: string, data: UpdateSiteUserData) => {
  const response = await api.put(`/client-site-users/${id}`, data);
  return response.data;
};

// Delete site user
export const deleteSiteUser = async (id: string) => {
  const response = await api.delete(`/client-site-users/${id}`);
  return response.data;
};

// Deactivate site user
export const deactivateSiteUser = async (id: string) => {
  const response = await api.patch(`/client-site-users/${id}/deactivate`);
  return response.data;
};

// Activate site user
export const activateSiteUser = async (id: string) => {
  const response = await api.patch(`/client-site-users/${id}/activate`);
  return response.data;
};
