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
  projectStatus: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
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
  getAll: async (): Promise<ApiResponse<{ projects: Project[] }>> => {
    const response = await apiMethods.get<BackendProject[]>(PROJECTS_ENDPOINTS.GET_ALL);
    
    // Debug: Log the raw backend response
    console.log('🔍 Raw backend response:', response);
    
    // Transform backend projects to frontend format
    // Backend returns projects directly in data array, not nested in data.projects
    // Backend uses projectName/projectStatus which matches our frontend types
    if (response.success && response.data && Array.isArray(response.data)) {
      console.log('🔍 Raw projects from backend:', response.data);
      
      const transformedProjects: Project[] = response.data.map((project: BackendProject) => ({
        ...project,
        // Ensure we have fallback values for undefined fields
        projectName: project.projectName || 'Untitled Project',
        projectStatus: project.projectStatus || 'planning'
      }));
      
      console.log('🔍 Transformed projects:', transformedProjects);
      
      return {
        ...response,
        data: { projects: transformedProjects }
      };
    }
    
    return {
      success: false,
      message: 'No projects data found',
      data: { projects: [] }
    } as ApiResponse<{ projects: Project[] }>;
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
