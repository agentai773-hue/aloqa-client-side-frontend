import { apiMethods } from '../../config/api';
import type { ApiResponse } from '../../config/api';
import type { Project } from '../../types/project';

// Projects specific endpoints
const PROJECTS_ENDPOINTS = {
  GET_ALL: '/projects',
  CREATE: '/projects',
  GET_BY_ID: '/projects',
  UPDATE: '/projects',
  DELETE: '/projects',
};

// Backend project interface (what comes from API)
interface BackendProject {
  _id: string;
  projectName: string;
  projectStatus: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'draft';
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  phoneNumberId?: string | {
    _id: string;
    phoneNumber: string;
    status: string;
  };
  phoneNumber?: string;
  assistantId?: string | {
    _id: string;
    agentId: string;
    agentName: string;
    agentType: string;
    id?: string;
  };
  assistantName?: string;
  projectDescription?: string;
  projectType?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface BackendProjectResponse {
  success: boolean;
  message: string;
  data: BackendProject[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

interface CreateProjectData {
  projectName: string;
  projectStatus?: string;
}

interface UpdateProjectData {
  projectName?: string;
  projectStatus?: string;
}

// Projects API
export const projectsAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<{ projects: Project[]; total: number; page: number; limit: number; totalPages: number }>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    
    const url = queryParams.toString() 
      ? `${PROJECTS_ENDPOINTS.GET_ALL}?${queryParams.toString()}`
      : PROJECTS_ENDPOINTS.GET_ALL;

    // API call to backend with pagination support  
    const response: BackendProjectResponse = await apiMethods.get<BackendProject[]>(url) as BackendProjectResponse;
    
    if (response.success && response.data && Array.isArray(response.data)) {
      // Transform backend projects to frontend format
      const transformedProjects: Project[] = response.data.map((project: BackendProject) => ({
        _id: project._id,
        projectName: project.projectName,
        projectStatus: project.projectStatus === 'draft' ? 'planning' : project.projectStatus,
        userId: project.userId,
        phoneNumberId: typeof project.phoneNumberId === 'object' && project.phoneNumberId
          ? {
              ...project.phoneNumberId,
              country: 'India' // Default country since backend doesn't provide it
            }
          : project.phoneNumberId || '',
        phoneNumber: project.phoneNumber,
        assistantId: project.assistantId || '',
        assistantName: project.assistantName || '',
        projectDescription: project.projectDescription || '',
        projectType: (project.projectType as Project['projectType']) || 'other',
        priority: (project.priority as Project['priority']) || 'medium',
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }));

      // Use backend pagination data - IMPORTANT: Don't calculate manually!
      const backendPagination = response.pagination;
      
      if (backendPagination) {
        // Backend pagination available - use it
        return {
          ...response,
          data: { 
            projects: transformedProjects,
            total: backendPagination.total,
            page: backendPagination.current,
            limit: backendPagination.limit,
            totalPages: backendPagination.pages
          }
        };
      } else {
        // Fallback if pagination not in response
        return {
          ...response,
          data: { 
            projects: transformedProjects,
            total: transformedProjects.length,
            page: params?.page || 1,
            limit: params?.limit || 7,
            totalPages: Math.ceil(transformedProjects.length / (params?.limit || 7))
          }
        };
      }
    }
    
    return {
      success: false,
      message: 'No projects data found',
      data: { 
        projects: [], 
        total: 0, 
        page: 1, 
        limit: 10, 
        totalPages: 0 
      }
    } as ApiResponse<{ projects: Project[]; total: number; page: number; limit: number; totalPages: number }>;
  },

  getById: async (id: string): Promise<ApiResponse<{ project: Project }>> => {
    return apiMethods.get<{ project: Project }>(`${PROJECTS_ENDPOINTS.GET_BY_ID}/${id}`);
  },

  create: async (data: CreateProjectData): Promise<ApiResponse<{ project: Project }>> => {
    return apiMethods.post<{ project: Project }>(PROJECTS_ENDPOINTS.CREATE, data);
  },

  update: async (id: string, data: UpdateProjectData): Promise<ApiResponse<{ project: Project }>> => {
    return apiMethods.put<{ project: Project }>(`${PROJECTS_ENDPOINTS.UPDATE}/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiMethods.delete<{ message: string }>(`${PROJECTS_ENDPOINTS.DELETE}/${id}`);
  },
};

// Export types
export type { Project, CreateProjectData, UpdateProjectData };
