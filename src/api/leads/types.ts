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
  projectId?: string;
  // Call-related fields
  call_status?: 'pending' | 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'no_answer' | 'failed' | 'voicemail' | 'busy' | 'cancelled';
  call_attempt_count?: number;
  max_retry_attempts?: number;
  call_disposition?: 'interested' | 'not_interested' | 'site_visit_scheduled' | 'callback_requested' | 'wrong_number' | 'language_barrier' | 'voicemail' | 'no_answer';
  last_call_attempt_time?: string;
  next_scheduled_call_time?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  message: string;
  data?: {
    created: number;
    skipped: number;
    leads: Lead[];
  };
  validation?: {
    totalUploaded: number;
    csvDuplicatesRemoved: number;
    csvDuplicateDetails?: Array<{
      phone: string;
      project: string;
      reason: string;
    }>;
    totalProcessedForDatabase: number;
    databaseDuplicatesSkipped: number;
    databaseDuplicateDetails?: Array<{
      name: string;
      phone: string;
      project: string;
      reason: string;
    }>;
    summary: {
      totalUploaded: number;
      csvDuplicatesRemoved: number;
      sentToDatabase: number;
      successfullySaved: number;
      databaseDuplicatesSkipped: number;
      finalMessage: string;
    };
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
