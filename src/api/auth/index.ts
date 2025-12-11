import { apiMethods, API_ENDPOINTS, APP_CONFIG } from '../../config/api';

// Types
export interface LoginCredentials {
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
  role: string;
  isApproval: number;
  bearerToken?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface VerifyResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
  code?: string;
  success: false;
}

// Auth API Service using the existing API configuration
export const authAPI = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Use requireAuth=false for login requests since user doesn't have token yet
      const response = await apiMethods.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials, false);
      
      // Store token in localStorage for persistence if login successful
      if (response.success && response.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(APP_CONFIG.AUTH.TOKEN_STORAGE_KEY, response.data.token);
        }
      }
      
      return response.data || response;
    } catch (error: unknown) {
      if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
        console.error('❌ Login API Error:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Verify current token
   */
  async verifyToken(): Promise<VerifyResponse> {
    try {
      const response = await apiMethods.post<VerifyResponse>(API_ENDPOINTS.VERIFY);
      return response.data || response;
    } catch (error: unknown) {
      // Clear invalid token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_STORAGE_KEY);
      }
      
      if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
        console.error('❌ Token verification failed:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiMethods.post<{ success: boolean; message: string }>(API_ENDPOINTS.LOGOUT);
      
      // Clear token from localStorage regardless of API response
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_STORAGE_KEY);
      }
      
      return response.data || response;
    } catch {
      // Even if API fails, clear local data
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_STORAGE_KEY);
      }
      
      // Return success because we cleared local data
      return { success: true, message: 'Logged out locally' };
    }
  },

  /**
   * Request password reset OTP
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; email: string }> {
    try {
      const response = await apiMethods.post<{ success: boolean; message: string; email: string }>(
        `${APP_CONFIG.API.CLIENT_PREFIX}/forgot-password/request`, 
        { email },
        false  // Password reset doesn't require authentication
      );
      return response.data || response;
    } catch (error: unknown) {
      if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
        console.error('❌ Password reset request failed:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Reset password with OTP
   */
  async resetPasswordWithOTP(data: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiMethods.post<{ success: boolean; message: string }>(
        `${APP_CONFIG.API.CLIENT_PREFIX}/forgot-password/reset`, 
        data,
        false  // Password reset doesn't require authentication
      );
      return response.data || response;
    } catch (error: unknown) {
      if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
        console.error('❌ Password reset failed:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(errorMessage);
    }
  },
};

export default authAPI;