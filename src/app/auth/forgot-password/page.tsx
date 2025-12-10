"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useRequestPasswordReset } from "@/hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [otpSent, setOtpSent] = useState(false);
  
  const { requestPasswordReset, loading } = useRequestPasswordReset();

  const validateEmail = (emailValue: string) => {
    const newErrors: { email?: string } = {};
    
    if (!emailValue.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    const result = await requestPasswordReset(email);
    if (result.success) {
      setOtpSent(true);
      setTimeout(() => {
        router.push(`/auth/forgot-password/reset?email=${encodeURIComponent(email)}`);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              No worries! Enter your email address and we&apos;ll send you an OTP to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {otpSent && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                OTP sent successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({});
                  }
                }}
                onBlur={() => validateEmail(email)}
                placeholder="Enter your registered email"
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                  errors.email
                    ? "border-red-500 bg-red-50 focus:border-red-600"
                    : "border-gray-200 bg-gray-50 focus:border-[#34DB17] focus:bg-white"
                }`}
                disabled={loading || otpSent}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otpSent}
              className="w-full py-3 px-4 bg-linear-to-r from-[#34DB17] to-[#306B25] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : otpSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  OTP Sent!
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#34DB17] hover:text-[#306B25] transition-colors"
              >
                Login
              </Link>
            </p>
            {/* <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-[#34DB17] hover:text-[#306B25] transition-colors"
              >
                Sign up
              </Link>
            </p> */}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              We&apos;ll send an OTP to your email. Check your inbox and spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
