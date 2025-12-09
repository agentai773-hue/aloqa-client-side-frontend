"use client";

import { useAuth } from '@/hooks/useAuth';
import { Clock, Mail, Phone, AlertCircle } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        
        {/* Status Card */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-8 text-center shadow-2xl">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-yellow-500/20 rounded-full">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Account Pending Approval
          </h1>
          
          {/* Message */}
          <div className="text-gray-300 mb-6 space-y-3">
            <p>
              Hi <span className="text-emerald-400 font-semibold">{user?.firstName}</span>,
            </p>
            <p>
              Your account has been successfully created but is currently pending approval from our admin team.
            </p>
            <p>
              You will receive an email notification once your account has been approved.
            </p>
          </div>
          
          {/* User Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{user?.email}</span>
            </div>
            {user?.mobile && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{user.mobile}</span>
              </div>
            )}
          </div>
          
          {/* Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">Note:</span> The approval process typically takes 1-2 business days. 
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = 'mailto:support@aloqa.ai'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </button>
            
            <button
              onClick={logout}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2025 Aloqa AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}