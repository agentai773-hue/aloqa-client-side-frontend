'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { updateLead, fetchLeadById } from '@/store/slices/leadsActions';
import { checkLeadExists } from '@/api/leads';
import { ArrowLeft } from 'lucide-react';

interface EditLeadFormData {
  full_name: string;
  contact_number: string;
  lead_type: 'pending' | 'hot' | 'cold' | 'fake' | 'connected';
  call_status: 'pending' | 'connected' | 'not_connected' | 'callback';
  project_name: string;
}

interface EditLeadFormProps {
  leadId: string;
}

export const EditLeadForm: React.FC<EditLeadFormProps> = ({ leadId }) => {
  const dispatch = useDispatch() as any;
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.leads);

  const [formData, setFormData] = useState<EditLeadFormData | null>(null);
  const [originalContactNumber, setOriginalContactNumber] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const [localSuccess, setLocalSuccess] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [loadingLead, setLoadingLead] = useState<boolean>(true);

  useEffect(() => {
    const loadLead = async () => {
      try {
        setLoadingLead(true);
        const result = await dispatch(fetchLeadById(leadId));

        if (result.success) {
          const lead = result.data;
          setFormData({
            full_name: lead.full_name,
            contact_number: lead.contact_number,
            lead_type: lead.lead_type,
            call_status: lead.call_status,
            project_name: lead.project_name || '',
          });
          setOriginalContactNumber(lead.contact_number);
        } else {
          setLocalError(result.error || 'Failed to load lead');
        }
      } catch (err: any) {
        setLocalError(err.message || 'An error occurred');
      } finally {
        setLoadingLead(false);
      }
    };

    loadLead();
  }, [leadId, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: value,
    }));
    setLocalError('');
    setLocalSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

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
      // If contact number changed, check if new number already exists
      if (formData.contact_number !== originalContactNumber) {
        setChecking(true);
        const checkResponse = await checkLeadExists(formData.contact_number);
        setChecking(false);

        if (checkResponse.exists) {
          setLocalError(`Lead with contact number ${formData.contact_number} already exists`);
          return;
        }
      }

      const result = await dispatch(updateLead(leadId, formData));

      if (result.success) {
        setLocalSuccess('Lead updated successfully!');
        setTimeout(() => {
          router.push('/dashboard/leads');
        }, 2000);
      } else {
        setLocalError(result.error || 'Failed to update lead');
      }
    } catch (err: any) {
      setChecking(false);
      setLocalError(err.message || 'An error occurred');
    }
  };

  if (loadingLead) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600">Failed to load lead. Please try again.</p>
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => router.push('/dashboard/leads')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Leads"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Lead</h2>
      </div>

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
              disabled={loading || checking}
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
              disabled={loading || checking}
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
              disabled={loading || checking}
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
              disabled={loading || checking}
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
              disabled={loading || checking}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/leads')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={loading || checking}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || checking}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading || checking ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
