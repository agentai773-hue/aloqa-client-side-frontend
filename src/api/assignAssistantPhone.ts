import axiosInstance from "@/utils/api";

export interface PhoneNumberInfo {
  _id: string;
  phoneNumber: string;
  friendlyName?: string;
  country?: string;
  isDefault?: boolean;
}

export interface AssistantInfo {
  _id: string;
  agentName: string;
  agentType?: string;
}

export interface AssignmentData {
  _id: string;
  userId: string;
  assistantId: AssistantInfo;
  phoneId: PhoneNumberInfo;
  projectName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignAssistantPhoneResponse {
  success: boolean;
  message: string;
  data?: AssignmentData | AssignmentData[];
  errors?: unknown[];
}

/**
 * Assign Assistant and Phone to a Project
 */
export async function assignAssistantPhone(
  assistantId: string,
  phoneId: string,
  projectName: string
): Promise<AssignAssistantPhoneResponse> {
  try {
    const response = await axiosInstance.post<AssignAssistantPhoneResponse>(
      "/client-assign-assistant-phone",
      {
        assistantId,
        phoneId,
        projectName,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all assignments for authenticated user
 */
export async function getAllAssignments(): Promise<AssignAssistantPhoneResponse> {
  try {
    const response = await axiosInstance.get<AssignAssistantPhoneResponse>(
      "/client-assign-assistant-phone"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get assignments by project name
 */
export async function getAssignmentsByProject(
  projectName: string
): Promise<AssignAssistantPhoneResponse> {
  try {
    const response = await axiosInstance.post<AssignAssistantPhoneResponse>(
      "/client-assign-assistant-phone/by-project",
      { projectName }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get single assignment by ID
 */
export async function getAssignmentById(
  assignmentId: string
): Promise<AssignAssistantPhoneResponse> {
  try {
    const response = await axiosInstance.get<AssignAssistantPhoneResponse>(
      `/client-assign-assistant-phone/${assignmentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Unassign (delete) an assignment
 */
export async function unassignAssistantPhone(
  assignmentId: string
): Promise<AssignAssistantPhoneResponse> {
  try {
    const response = await axiosInstance.delete<AssignAssistantPhoneResponse>(
      `/client-assign-assistant-phone/${assignmentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all projects for authenticated user
 */
export async function getProjectsList(): Promise<AssignAssistantPhoneResponse> {
  try {
    const response = await axiosInstance.get<AssignAssistantPhoneResponse>(
      "/client-assign-assistant-phone/projects/list"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
