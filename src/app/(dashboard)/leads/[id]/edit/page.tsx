'use client';

import React from 'react';
import { EditLeadForm } from '@/components/leads/EditLeadForm';

interface EditLeadPageProps {
  params: {
    id: string;
  };
}

export default function EditLeadPage({ params }: EditLeadPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Lead</h1>
          <p className="text-gray-600 mt-2">
            Update lead information
          </p>
        </div>

        {/* Edit Form */}
        <EditLeadForm leadId={params.id} />
      </div>
    </div>
  );
}
