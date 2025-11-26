import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  companyName: string;
  isApproval: number;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await axiosInstance.post('/client-auth/login', data);
  return response.data;
}

export async function verifyToken(): Promise<{ token: string; user: User }> {
  const response = await axiosInstance.post('/client-auth/verify', {});
  return response.data;
}

export default axiosInstance;
