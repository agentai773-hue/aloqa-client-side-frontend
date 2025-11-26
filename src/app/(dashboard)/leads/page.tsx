'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLeads, useDeleteLead, useCreateLead } from '@/hooks/useLeads';
import { Edit, Trash2, Phone, Plus, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { EditLeadModal } from '@/components/leads/EditLeadModal';

export default function LeadsPage() {
  const router = useRouter();
  const { data: leads = [], isLoading: leadsLoading, error: leadsError } = useLeads();
  const deleteLeadMutation = useDeleteLead();
  const createLeadMutation = useCreateLead();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'add' | 'import' | 'list'>('list');
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<string>('');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<any>(null);
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

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    // Value mapping for enum fields - maps CSV values to valid backend enum values
    const valueMapping: Record<string, Record<string, string>> = {
      'lead_type': {
        'high': 'hot',
        'High': 'hot',
        'medium': 'connected',
        'Medium': 'connected',
        'low': 'cold',
        'Low': 'cold',
        'hot': 'hot',
        'Hot': 'hot',
        'cold': 'cold',
        'Cold': 'cold',
        'pending': 'pending',
        'Pending': 'pending',
        'connected': 'connected',
        'Connected': 'connected',
        'fake': 'fake',
        'Fake': 'fake',
      },
      'call_status': {
        'new': 'pending',
        'New': 'pending',
        'pending': 'pending',
        'Pending': 'pending',
        'connected': 'connected',
        'Connected': 'connected',
        'not_connected': 'not_connected',
        'Not Connected': 'not_connected',
        'callback': 'callback',
        'Callback': 'callback',
        'hot': 'connected',
        'Hot': 'connected',
        'cold': 'not_connected',
        'Cold': 'not_connected',
      },
    };

    // Function to map CSV values to valid backend enum values
    const mapValue = (field: string, value: string): string => {
      const fieldMapping = valueMapping[field];
      if (fieldMapping && fieldMapping[value]) {
        return fieldMapping[value];
      }
      return value;
    };

    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
      complete: async (results) => {
        try {
          console.log('CSV Data:', results.data);
          
          const leadsData = results.data
            .filter((row: any) => {
              // Check if row has either full_name OR name field
              const fullName = row.full_name?.trim() || row.name?.trim() || row.fullname?.trim() || '';
              const contactNumber = row.contact_number?.trim() || row.contact?.trim() || row.phone?.trim() || '';
              return fullName.length > 0 && contactNumber.length > 0;
            })
            .map((row: any) => {
              // Get values from various possible column names
              const fullName = row.full_name?.trim() || row.name?.trim() || row.fullname?.trim() || '';
              const contactNumber = row.contact_number?.trim() || row.contact?.trim() || row.phone?.trim() || '';
              
              // Get lead_type with mapping
              let leadType = (row.lead_type?.trim() || row.type?.trim() || row.priority?.trim() || 'pending').toLowerCase();
              leadType = mapValue('lead_type', leadType);
              
              // Get call_status with mapping
              let callStatus = (row.call_status?.trim() || row.status?.trim() || 'pending').toLowerCase();
              callStatus = mapValue('call_status', callStatus);
              
              // Get project_name - only trim, don't remove if empty
              const projectName = row.project_name || row.project || '';
              
              return {
                full_name: fullName,
                contact_number: contactNumber,
                lead_type: leadType as 'pending' | 'hot' | 'cold' | 'fake' | 'connected',
                call_status: callStatus as 'pending' | 'connected' | 'not_connected' | 'callback',
                project_name: projectName || undefined,
              };
            });

          console.log('Processed Leads:', leadsData);
          console.log('Leads count:', leadsData.length);

          if (leadsData.length === 0) {
            setImportError('No valid leads found in CSV. Please check that your CSV has columns: full_name (or name), contact_number (or contact or phone)');
            return;
          }

          // Use createLead API for each row instead of batch import
          let successCount = 0;
          let failureCount = 0;
          const failedLeads: string[] = [];

          for (const lead of leadsData) {
            try {
              const leadPayload: any = {
                full_name: lead.full_name,
                contact_number: lead.contact_number,
                lead_type: lead.lead_type,
                call_status: lead.call_status,
              };
              
              // Always include project_name if it exists in the data, even if empty
              if (lead.project_name !== undefined) {
                leadPayload.project_name = lead.project_name;
              }
              
              await createLeadMutation.mutateAsync(leadPayload);
              successCount++;
            } catch (err: any) {
              // Check if it's a duplicate error - those are acceptable
              const errorMessage = err.response?.data?.error || err.message || '';
              const isDuplicate = errorMessage.includes('already exists');
              
              if (!isDuplicate) {
                failureCount++;
                failedLeads.push(`${lead.full_name} (${lead.contact_number})`);
              }
              // Log duplicate errors silently - they're expected
              console.log(`Lead already exists or skipped: ${lead.full_name} (${lead.contact_number})`);
            }
          }

          if (successCount > 0) {
            let message = `Successfully imported ${successCount} leads!`;
            if (failureCount > 0) {
              message += ` (${failureCount} failed: ${failedLeads.join(', ')})`;
            }
            setImportSuccess(message);
            setTimeout(() => {
              setImportSuccess('');
              setActiveTab('list');
            }, 3000);
          } else {
            setImportError(`Failed to import all leads. ${failedLeads.join(', ')}`);
          }
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err: any) {
          console.error('Import error:', err);
          setImportError(err.message || 'Failed to import leads');
        }
      },
      error: (error: any) => {
        console.error('Parse error:', error);
        setImportError(`CSV parsing error: ${error.message}`);
      },
    });
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
              onClick={() => setActiveTab('import')}
              className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'import'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="h-4 w-4" />
              Import CSV
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

        {activeTab === 'import' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Import Leads from CSV</h2>
            
            {importError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {importSuccess}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                CSV File Format Requirements:
              </label>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">Required Columns:</p>
                  <p>• Name: <code className="bg-gray-200 px-2 py-1">full_name</code> OR <code className="bg-gray-200 px-2 py-1">name</code></p>
                  <p>• Contact: <code className="bg-gray-200 px-2 py-1">contact_number</code> OR <code className="bg-gray-200 px-2 py-1">phone</code></p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-800">Optional Columns:</p>
                  <p>• Lead Type: <code className="bg-gray-200 px-2 py-1">lead_type</code> or <code className="bg-gray-200 px-2 py-1">priority</code></p>
                  <p className="text-xs ml-4">Valid values: pending, hot, cold, fake, connected (or high→hot, medium→connected, low→cold)</p>
                  <p>• Call Status: <code className="bg-gray-200 px-2 py-1">call_status</code> or <code className="bg-gray-200 px-2 py-1">status</code></p>
                  <p className="text-xs ml-4">Valid values: pending, connected, not_connected, callback (or new→pending, hot→connected, cold→not_connected)</p>
                  <p>• Project: <code className="bg-gray-200 px-2 py-1">project_name</code> or <code className="bg-gray-200 px-2 py-1">project</code></p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Upload your CSV file to import leads</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                disabled={createLeadMutation.isPending}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={createLeadMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {createLeadMutation.isPending ? 'Importing...' : 'Select CSV File'}
              </button>
            </div>

            {createLeadMutation.isError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Error: {(createLeadMutation.error as any)?.message || 'Failed to import leads'}
              </div>
            )}
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
                    {leads.map((lead: any) => (
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
                              onClick={() => {
                                setEditingLeadId(lead._id);
                                setEditingLead(lead);
                              }}
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

      {/* Edit Lead Modal */}
      <EditLeadModal
        leadId={editingLeadId || ''}
        isOpen={!!editingLeadId}
        lead={editingLead}
        onClose={() => {
          setEditingLeadId(null);
          setEditingLead(null);
        }}
        onSuccess={() => {
          setDeleteSuccess('Lead updated successfully!');
          setTimeout(() => setDeleteSuccess(''), 3000);
        }}
      />
    </div>
  );
}
