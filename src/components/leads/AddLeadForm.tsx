'use client';

import React, { useState } from 'react';
import { useCreateLead } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuthRedux';

interface AddLeadFormData {
  full_name: string;
  contact_number: string;

  lead_type: 'pending' | 'hot' | 'cold' | 'fake' | 'connected';
  call_status: 'pending' | 'connected' | 'not_connected' | 'callback';
  project_name: string;
}

export const AddLeadForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const createMutation = useCreateLead();
  const loading = createMutation.isPending;
  const error = createMutation.error?.message || '';

  const [formData, setFormData] = useState<AddLeadFormData>({
    full_name: '',
    contact_number: '',
    lead_type: 'pending',
    call_status: 'pending',
    project_name: '',
  });

  const [localError, setLocalError] = useState<string>('');
  const [localSuccess, setLocalSuccess] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
    setLocalSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name.trim()) {
      setLocalError('Full name is required');
      return;
    }
    if (!formData.contact_number.trim()) {
      setLocalError('Contact number is required');
      return;
    }
    if (formData.contact_number.length < 10) {
      setLocalError('Contact number must be at least 10 digits');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      setLocalSuccess('Lead created successfully!');
      setFormData({
        full_name: '',
        contact_number: '',
        lead_type: 'pending',
        call_status: 'pending',
        project_name: '',
      });
      setTimeout(() => setLocalSuccess(''), 3000);
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Lead</h2>

      {localError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {localError}
        </div>
      )}

      {localSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {localSuccess}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Lead Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Type *
            </label>
            <select
              name="lead_type"
              value={formData.lead_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="pending">Pending</option>
              <option value="hot">Hot</option>
              <option value="cold">Cold</option>
              <option value="fake">Fake</option>
              <option value="connected">Connected</option>
            </select>
          </div>

          {/* Call Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Status
            </label>
            <select
              name="call_status"
              value={formData.call_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="pending">Pending</option>
              <option value="connected">Connected</option>
              <option value="not_connected">Not Connected</option>
              <option value="callback">Callback</option>
            </select>
          </div>

          {/* Project Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              placeholder="Enter project name (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData({
                full_name: '',
                contact_number: '',
                lead_type: 'pending',
                call_status: 'pending',
                project_name: '',
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};
