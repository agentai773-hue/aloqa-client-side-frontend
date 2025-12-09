import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiMethods } from '@/config/api';

export function useRequestPasswordReset() {
  const [loading, setLoading] = useState(false);

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await apiMethods.post('/client/auth/forgot-password/request', { email });
      toast.success('Password reset email sent successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email';
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    requestPasswordReset,
    loading
  };
}

export function useResetPasswordWithOTP() {
  const [loading, setLoading] = useState(false);

  const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string) => {
    setLoading(true);
    try {
      await apiMethods.post('/client/auth/forgot-password/reset', { 
        email, 
        otp, 
        newPassword 
      });
      toast.success('Password reset successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPasswordWithOTP,
    loading
  };
}