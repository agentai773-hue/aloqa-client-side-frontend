import axiosInstance from '@/utils/api';

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Request password reset - sends OTP to user's email
 * @param email - User's email address
 * @returns Response with success status
 */
export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await axiosInstance.post<ForgotPasswordResponse>(
      '/client-auth/forgot-password/request',
      { email }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to send OTP'
    };
  }
}

/**
 * Reset password with OTP
 * @param data - Object containing email, OTP, and new password
 * @returns Response with success status
 */
export async function resetPasswordWithOTP(data: ResetPasswordRequest): Promise<ForgotPasswordResponse> {
  try {
    const response = await axiosInstance.post<ForgotPasswordResponse>(
      '/client-auth/forgot-password/reset',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to reset password'
    };
  }
}
