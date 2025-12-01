import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8082/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: allow cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token from cookies to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from cookies
    let token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle error responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from API response if available
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      error.message = errorMessage;
    } else if (error.response?.data?.error) {
      const errorMessage = error.response.data.error;
      error.message = errorMessage;
    }
    
    // Handle 401 errors - token might be expired
    if (error.response?.status === 401) {
      // Token is invalid or expired
      Cookies.remove('token');
    }
    
    return Promise.reject(error);
  }
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
  lastLogin?: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await axiosInstance.post('/client-auth/login', data);
  
  // Manually set token in cookies for live environment
  // Some browsers/environments require explicit cookie setting
  if (response.data.token) {
    Cookies.set('token', response.data.token, {
      expires: 10, // 10 days
      path: '/',
    });
  }
  
  return response.data;
}

export async function verifyToken(): Promise<{ token: string; user: User }> {
  const response = await axiosInstance.post('/client-auth/verify', {});
  return response.data;
}

export default axiosInstance;
