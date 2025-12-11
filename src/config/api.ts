// =============================================================================
// CENTRAL APPLICATION CONFIGURATION
// =============================================================================
// All configuration settings for the Aloqa AI Client Portal

// Environment Configuration
export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
    CLIENT_PREFIX: '/client',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    HEADERS: {
      'Content-Type': 'application/json',
    },
  },

  // Authentication Configuration
  AUTH: {
    TOKEN_STORAGE_KEY: 'token',
    COOKIE_NAME: 'token',
    TOKEN_EXPIRY_DAYS: 7,
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  },

  // Application Information
  APP: {
    NAME: 'Aloqa AI - Client Portal',
    VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    DEBUG: process.env.NODE_ENV === 'development',
  },

  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_DEBUG_LOGS: false, // Disabled console logging
    ENABLE_OFFLINE_SUPPORT: false,
    ENABLE_REAL_TIME_UPDATES: true,
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 4000, // 4 seconds
    DEBOUNCE_DELAY: 300, // 300ms
    ANIMATION_DURATION: 200, // 200ms
    PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    MAX_FILES_PER_UPLOAD: 5,
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_SPECIAL: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[+]?[1-9]?[0-9]{7,15}$/,
  },

  // Error Messages
  MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SUCCESS_DEFAULT: 'Operation completed successfully.',
  },

  // Development Configuration
  DEV: {
    MOCK_API_DELAY: 1000, // 1 second delay for mock APIs
    LOG_LEVEL: 'debug',
    SHOW_REDUX_DEVTOOLS: true,
  },
} as const;

// Convenience exports for backward compatibility
export const API_BASE_URL = APP_CONFIG.API.BASE_URL + APP_CONFIG.API.CLIENT_PREFIX;

// Debug logging for URL construction (both server and client side)
console.log('🔧 Client Frontend API Configuration:', {
  'process.env.NEXT_PUBLIC_API_BASE_URL': process.env.NEXT_PUBLIC_API_BASE_URL,
  'APP_CONFIG.API.BASE_URL': APP_CONFIG.API.BASE_URL,
  'APP_CONFIG.API.CLIENT_PREFIX': APP_CONFIG.API.CLIENT_PREFIX,
  'FINAL API_BASE_URL': API_BASE_URL,
  'NODE_ENV': process.env.NODE_ENV,
  'hostname': typeof window !== 'undefined' ? window.location.hostname : 'server'
});

export const API_ENDPOINTS = {
  // Auth endpoints (corrected to match backend)
  LOGIN: `/auth/login`,
  LOGOUT: `/auth/logout`,
  VERIFY: `/auth/verify`,
  
  // Other client endpoints
  LEADS: `/leads`,
  PROJECTS: `/projects`,
  PHONE_NUMBERS: `/phone-numbers`,
  ASSISTANTS: `/assistants`,
  DASHBOARD: `/dashboard`,
  CALL_HISTORY: `/call-history`,
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Get auth token from storage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  let token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_STORAGE_KEY);
  
  // If not in localStorage, try cookie
  if (!token) {
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|;\\s*)${APP_CONFIG.AUTH.COOKIE_NAME}=([^;]*)`));
    token = cookieMatch ? cookieMatch[1] : null;
  }
  
  return token;
};

// Get auth headers with token
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...APP_CONFIG.API.HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Type-safe environment variable access
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    if (APP_CONFIG.FEATURES.ENABLE_DEBUG_LOGS) {
      console.warn(`Environment variable ${key} is not set and no default provided`);
    }
    return '';
  }
  return value || defaultValue || '';
};

// Validate critical environment variables
export const validateEnvironment = (): void => {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    if (APP_CONFIG.APP.ENVIRONMENT === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
};

// =============================================================================
// API METHODS
// =============================================================================

export const apiMethods = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
     
      
      const response = await fetch(API_BASE_URL + url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
   
      return data;
    } catch (error) {
      console.error('❌ GET Error:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  },

  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
    
      
      const response = await fetch(API_BASE_URL + url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
        
          // Check if backend sends structured error response
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch {
          // Fallback to text if JSON parsing fails
          const errorText = await response.text();
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        
        // Return error in the expected format
        return {
          success: false,
          data: null as T,
          message: errorMessage
        };
      }

      const result = await response.json();
    
      return result;
    } catch (error) {
      console.error('❌ POST Error:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(API_BASE_URL + url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(API_BASE_URL + url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  },
};

// Initialize environment validation
if (typeof window === 'undefined') {
  validateEnvironment();
}

// Default export for easy importing
export default APP_CONFIG;
