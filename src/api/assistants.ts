import axiosInstance from "@/utils/api";

export interface Assistant {
  _id: string;
  agentName: string;
  agentType?: string;
  description?: string;
}

export interface AssistantsResponse {
  success: boolean;
  data: Assistant[];
  message?: string;
}

/**
 * Fetch all assistants for the authenticated user
 * Uses token from httpOnly cookie
 */
export async function fetchUserAssistants(): Promise<AssistantsResponse> {
  try {
    const response = await axiosInstance.get<AssistantsResponse>(
      "/client-assistants"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get single assistant by ID
 */
export async function getAssistantById(
  assistantId: string
): Promise<{ success: boolean; data: Assistant }> {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      data: Assistant;
    }>(`/client-assistants/${assistantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
