'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLead, useUpdateLead } from '@/hooks/useLeads';
import { ArrowLeft, Eye, Edit2 } from 'lucide-react';

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  
  const { data: lead, isLoading, error } = useLead(leadId);
  const updateMutation = useUpdateLead();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    lead_type: 'pending' as 'pending' | 'hot' | 'cold' | 'fake' | 'connected',
    call_status: 'pending' as 'pending' | 'connected' | 'not_connected' | 'callback' | 'completed',
    project_name: '',
  });

  const [localError, setLocalError] = useState<string>('');
  const [localSuccess, setLocalSuccess] = useState<string>('');

  // Set form data when lead loads
  useEffect(() => {
    if (lead) {
      setFormData({
        full_name: lead.full_name,
        contact_number: lead.contact_number,
        lead_type: lead.lead_type,
        call_status: lead.call_status,
        project_name: lead.project_name || '',
      });
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

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
      await updateMutation.mutateAsync({
        id: leadId,
        data: {
          full_name: formData.full_name,
          contact_number: formData.contact_number,
          lead_type: formData.lead_type,
          call_status: formData.call_status,
          project_name: formData.project_name || undefined,
        },
      });
      setLocalSuccess('Lead updated successfully!');
      setTimeout(() => {
        router.push('/leads');
      }, 1500);
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.error || 
        err?.message || 
        'Failed to update lead';
      setLocalError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium mb-4">Lead not found</p>
            <button
              onClick={() => router.push('/leads')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/leads')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Back to Leads"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isEditMode ? 'Edit Lead' : 'View Lead'}
              </h1>
              <p className="text-gray-600 mt-1">{formData.full_name}</p>
            </div>
          </div>
          
          {/* Toggle View/Edit */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isEditMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {isEditMode ? (
              <>
                <Eye className="h-5 w-5" />
                View Mode
              </>
            ) : (
              <>
                <Edit2 className="h-5 w-5" />
                Edit Mode
              </>
            )}
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8">
          {/* Error & Success Messages */}
          {localError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {localError}
            </div>
          )}

          {localSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {localSuccess}
            </div>
          )}

          {updateMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {(updateMutation.error as any)?.message || 'Failed to update lead'}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  required
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    isEditMode
                      ? 'bg-white cursor-text'
                      : 'bg-gray-50 cursor-not-allowed text-gray-600'
                  }`}
                  disabled={!isEditMode || updateMutation.isPending}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  required
                  placeholder="Enter contact number"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    isEditMode
                      ? 'bg-white cursor-text'
                      : 'bg-gray-50 cursor-not-allowed text-gray-600'
                  }`}
                  disabled={!isEditMode || updateMutation.isPending}
                />
              </div>

              {/* Lead Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lead Type *
                </label>
                <select
                  name="lead_type"
                  value={formData.lead_type}
                  onChange={handleChange}
                  required
                  disabled={!isEditMode || updateMutation.isPending}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    isEditMode
                      ? 'bg-white cursor-pointer'
                      : 'bg-gray-50 cursor-not-allowed text-gray-600'
                  }`}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Call Status *
                </label>
                <select
                  name="call_status"
                  value={formData.call_status}
                  onChange={handleChange}
                  required
                  disabled={!isEditMode || updateMutation.isPending}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    isEditMode
                      ? 'bg-white cursor-pointer'
                      : 'bg-gray-50 cursor-not-allowed text-gray-600'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="connected">Connected</option>
                  <option value="not_connected">Not Connected</option>
                  <option value="callback">Callback</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Project Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Enter project name (optional)"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    isEditMode
                      ? 'bg-white cursor-text'
                      : 'bg-gray-50 cursor-not-allowed text-gray-600'
                  }`}
                  disabled={!isEditMode || updateMutation.isPending}
                />
              </div>
            </div>

            {/* Additional Info (View Only) */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(lead.updated_at).toLocaleDateString()} {new Date(lead.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            {isEditMode && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData({
                      full_name: lead.full_name,
                      contact_number: lead.contact_number,
                      lead_type: lead.lead_type,
                      call_status: lead.call_status,
                      project_name: lead.project_name || '',
                    });
                    setLocalError('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
