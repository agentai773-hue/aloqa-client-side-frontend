"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useResetPasswordWithOTP } from "@/hooks/useForgotPassword";

function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [passwordReset, setPasswordReset] = useState(false);

  const { resetPasswordWithOTP, loading } = useResetPasswordWithOTP();

  useEffect(() => {
    if (!email) {
      router.push("/auth/forgot-password");
    }
  }, [email, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await resetPasswordWithOTP(email, otp, newPassword);
    if (result.success) {
      setPasswordReset(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-[#34DB17] to-[#306B25] rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 text-sm">
              Enter the OTP sent to your email and create a new password
            </p>
          </div>

          {/* Email Display */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Resetting password for:</span>
              <br />
              <span className="text-blue-600 font-medium">{email}</span>
            </p>
          </div>

          {/* Success Message */}
          {passwordReset && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                Password reset successful! Redirecting to login...
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 mb-2">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                  if (errors.otp) setErrors({ ...errors, otp: undefined });
                }}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none text-center text-2xl tracking-widest font-mono ${
                  errors.otp
                    ? "border-red-500 bg-red-50 focus:border-red-600"
                    : "border-gray-200 bg-gray-50 focus:border-[#34DB17] focus:bg-white"
                }`}
                disabled={loading || passwordReset}
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.otp}
                </p>
              )}
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    errors.newPassword
                      ? "border-red-500 bg-red-50 focus:border-red-600"
                      : "border-gray-200 bg-gray-50 focus:border-[#34DB17] focus:bg-white"
                  }`}
                  disabled={loading || passwordReset}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading || passwordReset}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    errors.confirmPassword
                      ? "border-red-500 bg-red-50 focus:border-red-600"
                      : "border-gray-200 bg-gray-50 focus:border-[#34DB17] focus:bg-white"
                  }`}
                  disabled={loading || passwordReset}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading || passwordReset}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordReset}
              className="w-full py-3 px-4 bg-linear-to-r from-[#34DB17] to-[#306B25] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </>
              ) : passwordReset ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Password Reset!
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#34DB17] hover:text-[#306B25] transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </div>

          {/* Info Text */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>OTP expires in 10 minutes.</strong> If you don&apos;t see the email, check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return <ResetPasswordForm email={email} />;
}
