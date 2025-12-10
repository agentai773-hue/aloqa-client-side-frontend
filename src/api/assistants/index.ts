import { apiMethods } from '../../config/api';
import type { ApiResponse } from '../../config/api';

// Assistant interface
export interface Assistant {
  _id: string;
  agentId: string;
  agentName: string;
  agentType: string;
}

// Assistants API
export const assistantsAPI = {
  // Get current user's assistants
  getUserAssistants: async (): Promise<ApiResponse<Assistant[]>> => {
    return apiMethods.get<Assistant[]>('/assistants');
  },
};