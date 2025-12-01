"use client";

import { Suspense } from "react";
import ResetPasswordContent from "./reset-password-content";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"><div className="text-gray-600">Loading...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
