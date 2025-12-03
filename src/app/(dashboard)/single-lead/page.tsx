'use client';

import React, { useState } from 'react';
import { useCreateLead } from '@/hooks/useLeads';
import { useProjects } from '@/hooks/useProjects';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SingleLeadPage() {
  const createLeadMutation = useCreateLead();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    project_name: '',
    lead_type: 'pending',
    call_status: 'pending',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createLeadMutation.mutateAsync({
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        project_name: formData.project_name || undefined,
        lead_type: formData.lead_type as any,
        call_status: formData.call_status as any,
      });

      setSuccess('✓ Lead created successfully!');
      setFormData({
        full_name: '',
        contact_number: '',
        project_name: '',
        lead_type: 'pending',
        call_status: 'pending',
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        {/* <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-[#34DB17] hover:text-[#306B25] font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Leads
        </Link> */}

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
          {/* Header */}
          <div className="bg-[#DEFFDF80] px-8 sm:px-12 py-10">
            <h1 className="text-4xl font-black text-gray-900">Add Single Lead</h1>
            <p className="text-gray-600 mt-3 text-lg">Create a new lead manually</p>
          </div>

          {/* Form Content */}
          <div className="p-8 sm:p-12">
            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <span className="font-medium text-base">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-8 p-5 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-4">
                <span className="text-2xl">✓</span>
                <span className="font-medium text-base">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name and Contact Number */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter Full Name"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34DB17] focus:border-transparent outline-none transition bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    placeholder="+91 1234567890"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34DB17] focus:border-transparent outline-none transition bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Project Name and Lead Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    disabled={projectsLoading}
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34DB17] focus:border-transparent outline-none transition bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {projectsLoading ? 'Loading projects...' : 'Select a project'}
                    </option>
                    {projects.map((project) => (
                      <option key={project} value={project}>
                        {project}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Lead Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.lead_type}
                    onChange={(e) => setFormData({ ...formData, lead_type: e.target.value })}
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34DB17] focus:border-transparent outline-none transition bg-white text-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="hot">Hot Lead</option>
                    <option value="cold">Cold Lead</option>
                    <option value="fake">Fake</option>
                    <option value="connected">Connected</option>
                  </select>
                </div>
              </div>

              {/* Call Status */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Call Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.call_status}
                  onChange={(e) => setFormData({ ...formData, call_status: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34DB17] focus:border-transparent outline-none transition bg-white text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="connected">Connected</option>
                  <option value="not_connected">Not Connected</option>
                  <option value="callback">Callback</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-6 pt-8 border-t border-gray-200">
                <Link
                  href="/leads"
                  className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="flex-1 px-8 py-4 bg-linear-to-r from-[#34DB17] to-[#306B25] text-white font-bold text-lg rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {createLeadMutation.isPending ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
