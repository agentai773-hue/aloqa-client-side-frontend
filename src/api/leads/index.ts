import axios, { AxiosError } from 'axios';
import { APP_CONFIG, getAuthToken } from '../../config/api';
import type { 
  Lead, 
  CreateLeadResponse, 
  LeadsListResponse, 
  UpdateLeadResponse, 
  DeleteLeadResponse 
} from './types';

// Create axios instance
const api = axios.create({
  baseURL: APP_CONFIG.API.BASE_URL + APP_CONFIG.API.CLIENT_PREFIX,
  timeout: APP_CONFIG.API.TIMEOUT,
  headers: APP_CONFIG.API.HEADERS,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized access - token may be expired');
    }
    return Promise.reject(error);
  }
);

// Leads specific endpoints
const LEADS_ENDPOINTS = {
  GET_ALL: '/leads',
  CREATE: '/leads/create',
  BULK_CREATE: '/leads/bulk',
  GET_BY_ID: '/leads',
  UPDATE: '/leads',
  DELETE: '/leads/delete', // Updated to use /delete endpoint
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
      
      const response = await api.get<{
        success: boolean;
        message: string;
        data: {
          leads: Lead[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }
      }>(url);

      // Backend already returns success/data structure, so we need to handle it properly
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Leads fetched successfully',
          data: response.data.data // Extract the actual data from backend response
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch leads',
          data: {
            leads: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        };
      }
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Failed to fetch leads';
      
      return {
        success: false,
        message: errorMessage,
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
      const response = await api.post<{ lead: Lead }>(LEADS_ENDPOINTS.CREATE, leadData);

      return {
        success: true,
        message: 'Lead created successfully',
        data: {
          created: 1,
          skipped: 0,
          leads: [response.data.lead]
        }
      };
    } catch (error) {
      console.error('API Error creating lead:', error);
      
      let errorMessage = 'Failed to create lead';
      
      if (error instanceof AxiosError && error.response?.data) {
        const backendError = error.response.data;
        
        // Check for different error field formats
        if (backendError.error) {
          errorMessage = backendError.error;
        } else if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.errors && Array.isArray(backendError.errors)) {
          errorMessage = backendError.errors.map((err: { msg?: string; message?: string }) => err.msg || err.message).join(', ');
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
        
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  createBulk: async (leads: Lead[]): Promise<CreateLeadResponse> => {
    try {
      const response = await api.post<CreateLeadResponse>(
        LEADS_ENDPOINTS.BULK_CREATE,
        { leads }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Failed to create leads';
        
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  getById: async (id: string): Promise<{ success: boolean; message: string; data?: Lead }> => {
    try {
      const response = await api.get<Lead>(`${LEADS_ENDPOINTS.GET_BY_ID}/${id}`);
      return {
        success: true,
        message: 'Lead fetched successfully',
        data: response.data
      };
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Lead not found';
        
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  update: async (id: string, data: Partial<Lead>): Promise<UpdateLeadResponse> => {
    try {
      const response = await api.put<Lead>(`${LEADS_ENDPOINTS.UPDATE}/${id}`, data);
      return {
        success: true,
        message: 'Lead updated successfully',
        data: response.data
      };
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Failed to update lead';
        
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  delete: async (id: string): Promise<DeleteLeadResponse> => {
    try {
      const response = await api.delete<{ message: string }>(`${LEADS_ENDPOINTS.DELETE}/${id}`);
      return {
        success: true,
        message: response.data.message || 'Lead deleted successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Failed to delete lead';
        
      return {
        success: false,
        message: errorMessage
      };
    }
  },
};
