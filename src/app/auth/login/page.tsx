"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PublicRoute from "@/components/auth/PublicRoute";
import { AloqaInlineLoader } from "@/components/loaders";

function LoginPageContent() {
  const router = useRouter();
  const { 
    login, 
    isAuthenticated, 
    isLoading, 
    loginError, 
    error, 
    clearLoginErrors 
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Redirect after login (smooth, no page refresh)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    // Clear previous errors
    clearLoginErrors();

    try {
      // Call login with credentials object
      const result = await login({ 
        email: formData.email, 
        password: formData.password 
      });
      
      // Check if login was successful using Redux Toolkit action result
      if (result.type.endsWith('/fulfilled')) {
        setFormData({ email: "", password: "" }); // Clear form on success
        // Redirect will happen automatically via useEffect
      } else {
        // Error will be displayed automatically via loginError state
      }
    } catch {
    }
  };

  // Get the appropriate error to display
  const displayError = loginError || error;

  return (
    <div className="min-h-screen flex bg-black overflow-hidden relative">
      
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 relative z-20">
        <div className="w-full max-w-sm flex flex-col justify-center">
          
          {/* Logo and Branding */}
          <div className="mb-12 text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.svg" alt="Aloqa AI" width={64} height={64} className="h-16 w-auto" />
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-gray-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-10 mb-6 shadow-2xl">
            
            {/* Welcome Text - Inside Card */}
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold mb-1">Welcome Back!</h2>
              <p className="text-gray-400 text-sm">Sign in to your AI Agent account</p>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-lg mb-6">
                <p className="text-red-400 text-sm">{displayError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    // Clear errors when user starts typing
                    if (displayError) {
                      clearLoginErrors();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  placeholder="Enter Your Email"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    // Clear errors when user starts typing
                    if (displayError) {
                      clearLoginErrors();
                    }
                  }}
                  className="w-full pl-12 pr-12 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  placeholder="Enter Your Password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-700 disabled:to-emerald-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50 mt-6 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <AloqaInlineLoader text="Signing in..." size="sm" barColor="white" textColor="white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600">
            © 2025 Aloqa AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Full Background Image/Visual */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-black to-black">
          <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Brain/AI Visual */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Login SVG Image with Animation */}
          <div className="animate-pulse drop-shadow-2xl relative">
            <Image 
              src="/login.svg" 
              alt="AI Calling" 
              width={800}
              height={800}
              className="w-full h-full max-w-2xl" 
              style={{ 
                filter: 'brightness(1.2) contrast(1.1)',
                mixBlendMode: 'screen'
              }}
            />
            {/* AI Text Overlay */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-emerald-400 drop-shadow-xl">AI</span>
            </div> */}
          </div>

          {/* Commented out Neural Network Section */}
          {/* 
          <svg
            width="400"
            height="400"
            viewBox="0 0 300 300"
            className="animate-pulse drop-shadow-2xl"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            <circle cx="150" cy="120" r="80" fill="none" stroke="#34d399" strokeWidth="3" opacity="0.9" filter="url(#glow)" />
            
            <line x1="150" y1="50" x2="150" y2="180" stroke="#34d399" strokeWidth="2" opacity="0.7" />
            <line x1="100" y1="80" x2="200" y2="80" stroke="#34d399" strokeWidth="2" opacity="0.7" />
            <line x1="100" y1="120" x2="200" y2="120" stroke="#34d399" strokeWidth="2" opacity="0.7" />
            <line x1="100" y1="160" x2="200" y2="160" stroke="#34d399" strokeWidth="2" opacity="0.7" />
            
            <circle cx="120" cy="100" r="7" fill="#34d399" opacity="0.9" filter="url(#glow)" />
            <circle cx="150" cy="90" r="7" fill="#34d399" opacity="0.9" filter="url(#glow)" />
            <circle cx="180" cy="100" r="7" fill="#34d399" opacity="0.9" filter="url(#glow)" />
            <circle cx="100" cy="150" r="7" fill="#34d399" opacity="0.9" filter="url(#glow)" />
            <circle cx="200" cy="150" r="7" fill="#34d399" opacity="0.9" filter="url(#glow)" />
            
            <text x="150" y="250" textAnchor="middle" fill="#34d399" fontSize="40" fontWeight="bold" fontFamily="Arial" filter="url(#glow)">
              AI
            </text>
          </svg>

          <p className="text-emerald-400 text-2xl font-bold mt-8 drop-shadow-lg">Powered by AI</p>
          <p className="text-gray-300 text-base mt-2 drop-shadow-lg">Intelligent Call Management</p>
          */}
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginPageContent />
    </PublicRoute>
  );
}
