// Lead API Types
export interface Lead {
  _id?: string;
  leadName: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  interestedProject: string;
  leadType: 'fake' | 'cold' | 'hot';
  notes: string;
  status: 'new' | 'old';
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  message: string;
  data?: {
    created: number;
    leads: Lead[];
  };
}

export interface LeadsListResponse {
  success: boolean;
  message: string;
  data: {
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateLeadResponse {
  success: boolean;
  message: string;
  data?: Lead;
}

export interface DeleteLeadResponse {
  success: boolean;
  message: string;
}
