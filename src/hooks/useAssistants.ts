import { useQuery } from "@tanstack/react-query";
import { fetchUserAssistants, Assistant } from "@/api/assistants";

export function useAssistants() {
  return useQuery<{ success: boolean; data: Assistant[] }>({
    queryKey: ["assistants"],
    queryFn: async () => {
      const result = await fetchUserAssistants();
      return {
        success: result.success,
        data: result.data || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    enabled: true, // Always enable - component will handle loading state
  });
}
