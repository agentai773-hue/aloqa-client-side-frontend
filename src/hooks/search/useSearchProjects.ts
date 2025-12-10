import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { projectsAPI } from '../../api/projects';
import type { Project } from '../../api/projects';

interface SearchProjectsParams {
  searchTerm: string;
  status?: string;
  projectType?: string;
  enabled?: boolean;
}

interface SearchProjectsResponse {
  success: boolean;
  data: Project[];
}

export const useSearchProjects = ({
  searchTerm,
  status,
  projectType,
  enabled = true,
}: SearchProjectsParams): UseQueryResult<SearchProjectsResponse, Error> => {
  return useQuery({
    queryKey: ['projectsSearch', searchTerm, status, projectType],
    queryFn: async () => {
      const result = await projectsAPI.getAll();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to search projects');
      }
      
      let filteredProjects = result.data?.projects || [];
      
      // Client-side filtering
      if (searchTerm) {
        filteredProjects = filteredProjects.filter(project =>
          project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.projectStatus?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (status && status !== 'all') {
        filteredProjects = filteredProjects.filter(project => 
          project.projectStatus === status
        );
      }
      
      if (projectType && projectType !== 'all') {
        filteredProjects = filteredProjects.filter(project => 
          project.projectType === projectType
        );
      }
      
      const searchResponse: SearchProjectsResponse = {
        success: result.success,
        data: filteredProjects,
      };
      
      return searchResponse;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useSearchProjects;