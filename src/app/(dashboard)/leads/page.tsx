'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeads, useDeleteLead, useCreateLead, useUpdateLead, useImportLeads } from '@/hooks/useLeads';
import { Edit, Trash2, Phone, Plus } from 'lucide-react';

export default function LeadsPage() {
  const router = useRouter();
  const { data: leads = [], isLoading: leadsLoading, error: leadsError } = useLeads();
  const deleteLeadMutation = useDeleteLead();
  const createLeadMutation = useCreateLead();
  const [activeTab, setActiveTab] = useState<'add' | 'import' | 'list'>('list');
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    lead_type: 'pending' as const,
    call_status: 'pending' as const,
    project_name: '',
  });

  const handleDeleteLead = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setDeleteError('');
      setDeleteSuccess('');
      try {
        await deleteLeadMutation.mutateAsync(id);
        setDeleteSuccess('Lead deleted successfully!');
        setTimeout(() => setDeleteSuccess(''), 3000);
      } catch (err: any) {
        setDeleteError(err.message || 'Failed to delete lead');
      }
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeadMutation.mutateAsync({
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        lead_type: formData.lead_type,
        call_status: formData.call_status,
        project_name: formData.project_name || undefined,
      });
      setFormData({
        full_name: '',
        contact_number: '',
        lead_type: 'pending',
        call_status: 'pending',
        project_name: '',
      });
      setActiveTab('list');
    } catch (err: any) {
      console.error('Error creating lead:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your real estate leads efficiently
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-4 px-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Leads ({leads?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter lead name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Type *
                  </label>
                  <select
                    required
                    value={formData.lead_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lead_type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="hot">Hot</option>
                    <option value="cold">Cold</option>
                    <option value="fake">Fake</option>
                    <option value="connected">Connected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Status *
                  </label>
                  <select
                    required
                    value={formData.call_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        call_status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="connected">Connected</option>
                    <option value="not_connected">Not Connected</option>
                    <option value="callback">Callback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {createLeadMutation.isPending ? 'Creating...' : 'Create Lead'}
              </button>
              {createLeadMutation.isError && (
                <div className="text-red-600 text-sm">
                  Error: {(createLeadMutation.error as any)?.message || 'Failed to create lead'}
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow">
            {deleteError && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-t">
                {deleteError}
              </div>
            )}

            {deleteSuccess && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-t">
                {deleteSuccess}
              </div>
            )}

            {leadsLoading && (
              <div className="p-8 text-center text-gray-600">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading leads...</p>
              </div>
            )}

            {/* {leadsError && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {(leadsError as any)?.message || 'Failed to load leads'}
              </div>
            )} */}

            {!leadsLoading && (!leads || leads.length === 0) && (
              <div className="p-8 text-center text-gray-600">
                <p>No leads found. Create your first lead!</p>
              </div>
            )}

            {!leadsLoading && leads && leads.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Lead Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Call Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lead.full_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {lead.contact_number}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.lead_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              lead.call_status === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : lead.call_status === 'not_connected'
                                  ? 'bg-red-100 text-red-800'
                                  : lead.call_status === 'callback'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {lead.call_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {lead.project_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <div className="flex items-center justify-start gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/leads/${lead._id}/edit`)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Lead"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => window.open(`tel:${lead.contact_number}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Call Lead"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              disabled={deleteLeadMutation.isPending}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
