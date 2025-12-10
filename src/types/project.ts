export interface Project {
  _id: string;
  projectName: string;
  projectStatus: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'testing' | 'draft';
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  phoneNumberId?: string | {
    _id: string;
    phoneNumber: string;
    country: string;
    status: string;
  };
  phoneNumber?: string; // Add direct phone number field from API
  assistantId: string | {
    _id: string;
    agentId: string;
    agentName: string;
    agentType: string;
  };
  assistantName?: string;
  projectDescription?: string;
  projectType?: 'lead-generation' | 'customer-support' | 'appointment-booking' | 'survey' | 'sales' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  projectName: string;
  assistantId: string; // Made mandatory
  phoneNumberId: string; // Made mandatory
  projectStatus?: Project['projectStatus'];
  projectDescription?: string;
  projectType?: Project['projectType'];
  priority?: Project['priority'];
  assistantName?: string; // Optional field for assistant name
  phoneNumber?: string; // Optional field for phone number
}

export interface UpdateProjectData {
  projectName?: string;
  projectStatus?: Project['projectStatus'];
  phoneNumberId?: string;
  assistantId?: string; // Optional for updates, but when provided must be valid
  projectDescription?: string;
  projectType?: Project['projectType'];
  priority?: Project['priority'];
  assistantName?: string; // Optional field for assistant name
  phoneNumber?: string; // Optional field for phone number
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}