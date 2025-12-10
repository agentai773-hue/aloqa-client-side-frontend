import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../api/projects';
import type { Project, CreateProjectData, UpdateProjectData } from '../types/project';

const PROJECTS_QUERY_KEY = ['projects'];

export function useProjects(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await projectsAPI.getAll(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch projects');
      }
      return response.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      // Transform the project data to match API expectations
      const apiData = {
        projectName: projectData.projectName,
        projectStatus: projectData.projectStatus || 'draft',
        phoneNumberId: projectData.phoneNumberId,
        phoneNumber: projectData.phoneNumber,
        assistantId: projectData.assistantId,
        assistantName: projectData.assistantName,
        projectDescription: projectData.projectDescription,
        projectType: projectData.projectType,
        priority: projectData.priority
      };
      
      const response = await projectsAPI.create(apiData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create project');
      }
      return response.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await projectsAPI.getById(id);
      if (!response.success) {
        throw new Error(response.message || 'Project not found');
      }
      return response.data?.project;
    },
    enabled: !!id,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProjectData & { _id: string }) => {
      // Transform the project data to match API expectations
      const { _id, projectName, projectStatus, ...otherData } = data;
      const apiData = {
        ...(projectName && { projectName: projectName }),
        ...(projectStatus && { projectStatus: projectStatus }),
        ...otherData
      };
      
      const response = await projectsAPI.update(_id, apiData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update project');
      }
      return response.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await projectsAPI.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete project');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export type { Project, CreateProjectData, UpdateProjectData };
export default useProjects;