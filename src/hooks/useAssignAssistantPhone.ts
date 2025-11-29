import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllAssignments,
  getAssignmentsByProject,
  assignAssistantPhone,
  unassignAssistantPhone,
  getProjectsList,
  AssignmentData,
  AssignAssistantPhoneResponse,
} from "@/api/assignAssistantPhone";

/**
 * Hook to fetch all assignments for user
 */
export function useAllAssignments() {
  return useQuery<AssignAssistantPhoneResponse>({
    queryKey: ["assignments"],
    queryFn: async () => await getAllAssignments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch assignments by project
 */
export function useAssignmentsByProject(projectName: string | null) {
  return useQuery<AssignAssistantPhoneResponse>({
    queryKey: ["assignments", "byProject", projectName],
    queryFn: async () => {
      if (!projectName) throw new Error("Project name is required");
      return await getAssignmentsByProject(projectName);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!projectName, // Only run when projectName exists
  });
}

/**
 * Hook to fetch projects list
 */
export function useProjectsList() {
  return useQuery<AssignAssistantPhoneResponse>({
    queryKey: ["projects"],
    queryFn: async () => await getProjectsList(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to assign assistant and phone to project
 */
export function useAssignAssistantPhoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assistantId,
      phoneId,
      projectName,
    }: {
      assistantId: string;
      phoneId: string;
      projectName: string;
    }) => assignAssistantPhone(assistantId, phoneId, projectName),

    onSuccess: (data) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },

    onError: (error: any) => {
      console.error("Mutation error:", error);
    },
  });
}

/**
 * Hook to unassign assistant and phone
 */
export function useUnassignAssistantPhoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) =>
      unassignAssistantPhone(assignmentId),

    onSuccess: (data) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },

    onError: (error: any) => {
      console.error("Mutation error:", error);
    },
  });
}
