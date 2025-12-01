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

// Add token from cookies or localStorage to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first (httpOnly from backend)
    let token = Cookies.get('token');
    
    // If not in cookies, try localStorage (for app startup verification)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token') || undefined;
    }
    
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
      error.message = error.response.data.message;
    } else if (error.response?.data?.error) {
      error.message = error.response.data.error;
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
  
  // Backend will set httpOnly cookie automatically
  // Store token in localStorage so we can verify on page refresh
  if (response.data.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      console.log('✅ Token saved to localStorage for persistence');
    }
  }
  
  return response.data;
}

export async function verifyToken(): Promise<{ token: string; user: User }> {
  try {
    const response = await axiosInstance.post('/client-auth/verify', {});
    
    // If backend returns a token, save to localStorage
    if (response.data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      console.log('✅ Token verified and saved');
    }
    
    return response.data;
  } catch (error: any) {
    // If token is invalid or expired, remove it
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      Cookies.remove('token');
      console.log('❌ Token removed - verification failed');
    }
    throw error;
  }
}

export default axiosInstance;
