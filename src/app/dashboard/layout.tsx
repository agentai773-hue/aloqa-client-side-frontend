'use client';

import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ProtectedLayout>
        {children}
      </ProtectedLayout>
    </ProtectedRoute>
  );
}