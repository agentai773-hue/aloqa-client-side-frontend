import axiosInstance from './auth-api';

export interface Lead {
  _id: string;
  full_name: string;
  contact_number: string;
  lead_type: 'pending' | 'hot' | 'cold' | 'fake' | 'connected';
  call_status: 'pending' | 'connected' | 'not_connected' | 'callback';
  project_name: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadRequest {
  full_name: string;
  contact_number: string;
  lead_type: 'pending' | 'hot' | 'cold' | 'fake' | 'connected';
  call_status?: 'pending' | 'connected' | 'not_connected' | 'callback';
  project_name?: string | null;
}

export interface UpdateLeadRequest {
  full_name?: string;
  contact_number?: string;
  lead_type?: 'pending' | 'hot' | 'cold' | 'fake' | 'connected';
  call_status?: 'pending' | 'connected' | 'not_connected' | 'callback' | 'completed';
  project_name?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  exists?: boolean;
  message?: string;
  error?: string;
}

// Check if lead exists
export async function checkLeadExists(contactNumber: string): Promise<ApiResponse<Lead>> {
  const response = await axiosInstance.get('/leads/check', {
    params: { contact_number: contactNumber },
  });
  return response.data;
}
 
// Create lead
export async function createLead(leadData: CreateLeadRequest): Promise<ApiResponse<Lead>> {
  const response = await axiosInstance.post('/leads/create', leadData);
  return response.data;
}

// Get all leads for current user
export async function getAllLeads(): Promise<ApiResponse<Lead[]>> {
  const response = await axiosInstance.get('/leads/all');
  return response.data;
}

// Get single lead by ID
export async function getLeadById(id: string): Promise<ApiResponse<Lead>> {
  const response = await axiosInstance.get(`/leads/${id}`);
  return response.data;
}

// Update lead
export async function updateLead(
  id: string,
  updateData: UpdateLeadRequest
): Promise<ApiResponse<Lead>> {
  const response = await axiosInstance.put(`/leads/${id}`, updateData);
  return response.data;
}

// Delete lead
export async function deleteLead(id: string): Promise<ApiResponse<Lead>> {
  const response = await axiosInstance.delete(`/leads/${id}`);
  return response.data;
}

// Import leads from CSV
export async function importLeads(
  leadsData: CreateLeadRequest[]
): Promise<
  ApiResponse<{
    leads: Lead[];
    meta: {
      skippedDuplicatesInCSV: string[];
      skippedExistingInDB: string[];
      invalidRows: Array<{ row: any; reason: string }>;
    };
  }>
> {
  const response = await axiosInstance.post('/leads/import/csv', {
    leadsData,
  });
  return response.data;
}

// Search leads with filters
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

export async function searchLeads(
  searchTerm: string = '',
  page: number = 1,
  pageSize: number = 10,
  leadType: string = 'all',
  callStatus: string = 'all',
  dateRange: string = 'all'
): Promise<SearchLeadsResponse> {
  const response = await axiosInstance.post('/leads/search', {
    searchTerm,
    page,
    pageSize,
    leadType,
    callStatus,
    dateRange,
  });
  return response.data;
}
