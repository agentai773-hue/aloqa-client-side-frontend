import { useQuery } from '@tanstack/react-query';
import { assistantsAPI } from '../api/assistants';
import type { Assistant } from '../api/assistants';

export const useAssistants = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['userAssistants'],
    queryFn: assistantsAPI.getUserAssistants,
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: enabled, // Only fetch when enabled
  });
};

// Helper hook to get assistants as options for dropdowns
export const useAssistantOptions = (enabled: boolean = true) => {
  const { data: assistants, ...rest } = useAssistants(enabled);
  
  const options = assistants?.map((assistant: Assistant) => ({
    value: assistant._id,
    label: assistant.agentName,
    agentId: assistant.agentId,
    agentType: assistant.agentType,
  })) || [];

  return {
    options,
    assistants,
    ...rest,
  };
};