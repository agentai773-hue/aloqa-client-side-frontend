import { apiMethods, ApiError } from '../../config/api';
import type { 
  Lead, 
  CreateLeadResponse, 
  LeadsListResponse, 
  UpdateLeadResponse, 
  DeleteLeadResponse 
} from './types';

// Leads specific endpoints
const LEADS_ENDPOINTS = {
  GET_ALL: '/leads',
  CREATE: '/leads',
  BULK_CREATE: '/leads/bulk',
  GET_BY_ID: '/leads',
  UPDATE: '/leads',
  DELETE: '/leads',
  STATS: '/leads/stats',
};

// Export types
export * from './types';

// Leads API
export const leadsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    leadType?: string;
  }): Promise<LeadsListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.leadType) queryParams.append('leadType', params.leadType);

      const url = `${LEADS_ENDPOINTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🔍 Leads API call with params:', params);
      console.log('🔍 Leads API URL:', url);
      
      const response = await apiMethods.get<{ leads: Lead[]; total: number; page: number; limit: number; totalPages: number }>(url);

      console.log('🔍 Leads API response:', response);

      return {
        success: true,
        message: response.message || 'Leads fetched successfully',
        data: response.data
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('❌ Get leads error:', apiError);
      
      return {
        success: false,
        message: apiError.message || 'Failed to fetch leads',
        data: {
          leads: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    }
  },

  create: async (leadData: Lead): Promise<CreateLeadResponse> => {
    try {
      const response = await apiMethods.post<{ lead: Lead }>(LEADS_ENDPOINTS.CREATE, leadData);

      return {
        success: true,
        message: response.message || 'Lead created successfully',
        data: {
          created: 1,
          leads: [response.data.lead]
        }
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message || 'Failed to create lead'
      };
    }
  },

  createBulk: async (leads: Lead[]): Promise<CreateLeadResponse> => {
    try {
      const response = await apiMethods.post<{ created: number; leads: Lead[] }>(
        LEADS_ENDPOINTS.BULK_CREATE,
        { leads }
      );

      return {
        success: true,
        message: response.message || 'Leads created successfully',
        data: response.data
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message || 'Failed to create leads'
      };
    }
  },

  getById: async (id: string): Promise<{ success: boolean; message: string; data?: Lead }> => {
    try {
      const response = await apiMethods.get<Lead>(`${LEADS_ENDPOINTS.GET_BY_ID}/${id}`);
      return {
        success: true,
        message: response.message || 'Lead fetched successfully',
        data: response.data
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message || 'Lead not found'
      };
    }
  },

  update: async (id: string, data: Partial<Lead>): Promise<UpdateLeadResponse> => {
    try {
      const response = await apiMethods.put<Lead>(`${LEADS_ENDPOINTS.UPDATE}/${id}`, data);
      return {
        success: true,
        message: response.message || 'Lead updated successfully',
        data: response.data
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message || 'Failed to update lead'
      };
    }
  },

  delete: async (id: string): Promise<DeleteLeadResponse> => {
    try {
      const response = await apiMethods.delete<{ message: string }>(`${LEADS_ENDPOINTS.DELETE}/${id}`);
      return {
        success: true,
        message: response.message || 'Lead deleted successfully'
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message || 'Failed to delete lead'
      };
    }
  },
};
