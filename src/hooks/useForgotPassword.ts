import { useMutation } from '@tanstack/react-query';
import { 
  requestPasswordReset, 
  resetPasswordWithOTP, 
  ResetPasswordRequest,
  ForgotPasswordResponse
} from '@/api/forgot-password';

/**
 * Hook to request password reset (send OTP to email)
 */
export function useRequestPasswordReset() {
  return useMutation<ForgotPasswordResponse, Error, string>({
    mutationFn: async (email: string) => {
      const response = await requestPasswordReset(email);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }
      return response;
    },
    onError: (error: any) => {
      console.error('Request password reset error:', error);
    }
  });
}

/**
 * Hook to reset password with OTP
 */
export function useResetPasswordWithOTP() {
  return useMutation<ForgotPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await resetPasswordWithOTP(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
      return response;
    },
    onError: (error: any) => {
      console.error('Reset password error:', error);
    }
  });
}
