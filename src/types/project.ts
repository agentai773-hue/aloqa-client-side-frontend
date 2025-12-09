export interface Project {
  _id: string;
  projectName: string;
  projectStatus: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
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
  assistantId?: string | {
    _id: string;
    agentId: string;
    agentName: string;
    agentType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  projectName: string;
  projectStatus?: Project['projectStatus'];
  phoneNumberId?: string;
  assistantId?: string;
}

export interface UpdateProjectData {
  projectName?: string;
  projectStatus?: Project['projectStatus'];
  phoneNumberId?: string;
  assistantId?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}