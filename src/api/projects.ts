import axiosInstance from './auth-api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getProjects(): Promise<ApiResponse<string[]>> {
  const response = await axiosInstance.get('/leads/projects/list');
  return response.data;
}
