'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddSiteUserForm, SiteUsersTable } from '@/components/site-users';

export default function SiteUserPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title Section */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Site Users
            </h1>
            <p className="text-gray-600 mt-2 text-lg font-medium">
              Manage and track your site visit users
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Site User
          </button>
        </div>

        {/* Site Users Table */}
        <SiteUsersTable />
      </div>

      {/* Add Site User Modal */}
      <AddSiteUserForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
