'use client';

import React, { useEffect } from 'react';
import { useUpdateLead } from '@/hooks/useLeads';
import { X } from 'lucide-react';

interface EditLeadModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  lead: any;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onSuccess,
  lead,
}) => {
  const updateMutation = useUpdateLead();

  const [formData, setFormData] = React.useState({
    full_name: '',
    contact_number: '',
    lead_type: 'pending' as 'pending' | 'hot' | 'cold' | 'fake' | 'connected',
    call_status: 'pending' as 'pending' | 'connected' | 'not_connected' | 'callback',
    project_name: '',
  });

  const [localError, setLocalError] = React.useState<string>('');
  const [localSuccess, setLocalSuccess] = React.useState<string>('');

  // Set form data when lead loads
  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        full_name: lead.full_name,
        contact_number: lead.contact_number,
        lead_type: lead.lead_type,
        call_status: lead.call_status,
        project_name: lead.project_name || '',
      });
      setLocalError('');
      setLocalSuccess('');
    }
  }, [lead, isOpen]);

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
        id: lead._id,
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
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      // Extract error message from different sources
      const errorMessage = 
        err?.response?.data?.error || 
        err?.message || 
        'Failed to update lead';
      setLocalError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {localError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {localError}
            </div>
          )}

          {localSuccess && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {localSuccess}
            </div>
          )}

          {updateMutation.isError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {(updateMutation.error as any)?.message || 'Failed to update lead'}
            </div>
          )}

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
                required
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
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
                required
                placeholder="Enter contact number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
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
                Call Status *
              </label>
              <select
                name="call_status"
                value={formData.call_status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
