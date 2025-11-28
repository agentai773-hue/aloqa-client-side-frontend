'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLeads, useDeleteLead, useCreateLead } from '@/hooks/useLeads';
import { useInitiateCall } from '@/hooks/useInitiateCall';
import { useCallHistory } from '@/hooks/useInitiateCall';
import { useSiteVisitData } from '@/hooks/useSiteVisits';
import { Edit, Trash2, Phone, Plus, Upload, Play, Calendar, MapPin, Clock } from 'lucide-react';
import Papa from 'papaparse';
import { EditLeadModal } from '@/components/leads/EditLeadModal';

export default function LeadsPage() {
  const router = useRouter();
  const { data: leads = [], isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useLeads();
  const deleteLeadMutation = useDeleteLead();
  const createLeadMutation = useCreateLead();
  const callMutation = useInitiateCall();
  const { data: callHistoryData } = useCallHistory(1, 1000); // Fetch all calls for recordings
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recordingsSidebar, setRecordingsSidebar] = useState<any>(null);
  const [siteVisitsSidebar, setSiteVisitsSidebar] = useState<any>(null);
  const [sidebarTab, setSidebarTab] = useState<'recordings' | 'site-visits'>('recordings');

  // Debug: Log call history data whenever it changes
  React.useEffect(() => {
    console.log('📞 useCallHistory data updated:', callHistoryData);
    if (callHistoryData?.data && Array.isArray(callHistoryData.data)) {
      console.log('📊 Total calls:', (callHistoryData.data as any[]).length);
      console.log('📊 Calls with recording:', (callHistoryData.data as any[]).filter((c: any) => c.recordingUrl).length);
    }
  }, [callHistoryData]);

  const [activeTab, setActiveTab] = useState<'add' | 'import' | 'list'>('list');
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<string>('');
  const [callError, setCallError] = useState<string>('');
  const [callSuccess, setCallSuccess] = useState<string>('');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    lead_type: 'pending' as const,
    call_status: 'pending' as const,
    project_name: '',
  });

  // Get all recordings for a specific lead
  const getLeadRecordings = (leadId: string) => {
    const calls = (callHistoryData?.data as any[]) || [];
    console.log('🔍 Call History Data:', callHistoryData);
    console.log('🔍 All Calls:', calls);
    console.log('🔍 Looking for lead:', leadId);
    const filtered = calls.filter(call => {
      console.log('📞 Checking call:', { callLeadId: call.leadId, hasRecording: !!call.recordingUrl });
      return call.leadId === leadId && call.recordingUrl;
    });
    console.log('✅ Filtered recordings for', leadId, ':', filtered);
    return filtered;
  };

  const handleViewRecordings = (leadId: string, leadName: string) => {
    console.log('👆 View Recordings clicked for:', leadName, leadId);
    const recordings = getLeadRecordings(leadId);
    console.log('📊 Found recordings:', recordings);
    setRecordingsSidebar({ leadId, leadName, recordings });
  };

  const handlePlayRecording = (call: any) => {
    console.log('▶️ Playing recording:', call);
    console.log('📊 Recording details:', {
      recordingUrl: call.recordingUrl,
      callDuration: call.callDuration,
      createdAt: call.createdAt,
      projectName: call.projectName,
      executionDetails: call.executionDetails ? 'exists' : 'missing',
      hasTranscript: !!call.executionDetails?.transcript
    });
    setSelectedRecording(call);
    setRecordingsSidebar(null);
  };

  const handleViewSiteVisits = (leadId: string, leadName: string, leadData: any) => {
    setSiteVisitsSidebar({ leadId, leadName, leadData });
    setSidebarTab('site-visits');
  };

  const handleCallLead = async (leadId: string) => {
    setCallError('');
    setCallSuccess('');
    try {
      const result = await callMutation.mutateAsync({ leadId });
      if (result.success) {
        setCallSuccess(`Call initiated successfully! Calling ${result.data?.lead_name}`);
        setTimeout(() => setCallSuccess(''), 5000);
      }
    } catch (err: any) {
      setCallError(err.message || 'Failed to initiate call');
      setTimeout(() => setCallError(''), 5000);
    }
  };

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
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {(createLeadMutation.error as any)?.response?.data?.error || 
                   (createLeadMutation.error as any)?.message || 
                   'Failed to create lead'}
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
            {callError && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-t">
                {callError}
              </div>
            )}

            {callSuccess && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-t">
                {callSuccess}
              </div>
            )}

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
                            {getLeadRecordings(lead._id).length > 0 ? (
                              <button
                                onClick={() => handleViewRecordings(lead._id, lead.full_name)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={`View ${getLeadRecordings(lead._id).length} Recording(s)`}
                              >
                                <Play className="h-4 w-4 fill-current" />
                              </button>
                            ) : lead.call_status === 'completed' ? null : (
                              <button
                                onClick={() => handleCallLead(lead._id)}
                                disabled={callMutation.isPending}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Call Lead"
                              >
                                <Phone className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleViewSiteVisits(lead._id, lead.full_name, lead)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Site Visits"
                            >
                              <Calendar className="h-4 w-4" />
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
          refetchLeads();
        }}
      />

      {/* Recording Modal */}
      {selectedRecording && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedRecording(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">{selectedRecording.callerName || 'Call Recording'}</h3>
              
              {/* Audio Player */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <audio
                  controls
                  autoPlay
                  className="w-full"
                >
                  <source src={selectedRecording.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              {/* Details */}
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p><strong>Duration:</strong> {selectedRecording.callDuration || 0}s</p>
                <p><strong>Date:</strong> {new Date(selectedRecording.createdAt).toLocaleDateString()} at {new Date(selectedRecording.createdAt).toLocaleTimeString()}</p>
                <p><strong>Project:</strong> {selectedRecording.projectName || '-'}</p>
              </div>

              {/* Transcript Section */}
              {(() => {
                const hasTranscript = selectedRecording.executionDetails?.transcript;
                console.log('🎤 Checking transcript:', {
                  hasExecutionDetails: !!selectedRecording.executionDetails,
                  transcript: selectedRecording.executionDetails?.transcript,
                  hasTranscript
                });
                
                if (!hasTranscript) {
                  console.log('❌ No transcript found');
                  return null;
                }
                
                console.log('✅ Rendering transcript');
                return (
                  <div className="mb-6 border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Transcript</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-3 text-sm">
                        {selectedRecording.executionDetails.transcript.split('\n').map((line: string, idx: number) => {
                          const isAgent = line.toLowerCase().startsWith('assistant:');
                          const text = line.replace(/^(assistant:|user:)\s*/i, '').trim();
                          
                          if (!text) return null;
                          
                          return (
                            <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-xs rounded-lg p-3 ${
                                isAgent 
                                  ? 'bg-blue-100 text-gray-900 border-l-4 border-blue-600' 
                                  : 'bg-gray-200 text-gray-900'
                              }`}>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  {isAgent ? 'Assistant' : 'User'}
                                </p>
                                <p className="text-sm leading-relaxed">{text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Buttons */}
              <div className="flex gap-3">
                <a
                  href={selectedRecording.recordingUrl}
                  download
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm"
                >
                  Download
                </a>
                <button
                  onClick={() => setSelectedRecording(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recordings Sidebar */}
      {recordingsSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setRecordingsSidebar(null)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div className="animate-[slideIn_0.3s_ease-out]">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recordings</h2>
                  <p className="text-sm text-gray-600 mt-1">{recordingsSidebar.leadName}</p>
                </div>
                <button
                  onClick={() => setRecordingsSidebar(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Recordings List */}
              <div className="p-6 space-y-4">
                {recordingsSidebar.recordings.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No recordings found</p>
                ) : (
                  recordingsSidebar.recordings.map((recording: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      {/* Recording Info */}
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          Recording {idx + 1}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(recording.createdAt).toLocaleDateString()} at {new Date(recording.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Duration: {recording.callDuration || 0}s
                        </p>
                      </div>

                      {/* Audio Player */}
                      <div className="mb-3 bg-gray-50 rounded p-2">
                        <audio controls className="w-full h-8">
                          <source src={recording.recordingUrl} type="audio/mpeg" />
                        </audio>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePlayRecording(recording)}
                          className="flex-1 text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Full View
                        </button>
                        {recording.executionDetails?.transcript && (
                          <button
                            onClick={() => {
                              setSelectedRecording(recording);
                              setRecordingsSidebar(null);
                            }}
                            className="flex-1 text-xs px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                          >
                            Transcript
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Site Visits Sidebar */}
      {siteVisitsSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSiteVisitsSidebar(null)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div className="animate-[slideIn_0.3s_ease-out]">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Site Visits</h2>
                  <p className="text-sm text-gray-600 mt-1">{siteVisitsSidebar.leadName}</p>
                </div>
                <button
                  onClick={() => setSiteVisitsSidebar(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Site Visits List */}
              <SiteVisitsList 
                leadId={siteVisitsSidebar.leadId} 
                leadData={siteVisitsSidebar.leadData}
                callHistoryData={callHistoryData}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Component to display site visits for a lead
 */
function SiteVisitsList({ 
  leadId, 
  leadData, 
  callHistoryData 
}: { 
  leadId: string; 
  leadData: any;
  callHistoryData?: any;
}) {
  const { allSiteVisits, upcomingSiteVisits, completedSiteVisits, isLoading, error } = useSiteVisitData(leadId);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const visitsToDisplay =
    activeFilter === 'upcoming' ? upcomingSiteVisits : activeFilter === 'completed' ? completedSiteVisits : allSiteVisits;

  // Get recordings for this lead
  const leadRecordings = React.useMemo(() => {
    if (!callHistoryData?.data) return [];
    const calls = callHistoryData.data as any[];
    return calls.filter(call => call.leadId === leadId && call.recordingUrl);
  }, [callHistoryData, leadId]);

  return (
    <div className="p-6 space-y-4">
      {/* Lead Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-gray-900">{leadData?.full_name}</p>
        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
          <Phone className="h-3 w-3" />
          {leadData?.contact_number}
        </p>
        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          {leadData?.project_name || 'N/A'}
        </p>
      </div>

      {/* Recordings Section */}
      {leadRecordings.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Play className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-semibold text-gray-900">Recordings ({leadRecordings.length})</p>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {leadRecordings.map((recording: any, idx: number) => (
              <div key={idx} className="bg-white p-2 rounded border border-purple-100 text-xs">
                <p className="font-medium text-gray-900">Recording {idx + 1}</p>
                <p className="text-gray-600 mt-0.5">
                  {new Date(recording.createdAt).toLocaleDateString()} at {new Date(recording.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-gray-600">Duration: {recording.callDuration || 0}s</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeFilter === 'upcoming'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingSiteVisits.length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeFilter === 'completed'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedSiteVisits.length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeFilter === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({allSiteVisits.length})
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          Error loading site visits: {(error as any)?.message}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && visitsToDisplay.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-600 text-sm">No {activeFilter === 'upcoming' ? 'upcoming' : activeFilter === 'completed' ? 'completed' : ''} site visits</p>
        </div>
      )}

      {/* Site Visits List */}
      {!isLoading && visitsToDisplay.length > 0 && (
        <div className="space-y-3">
          {visitsToDisplay.map((visit: any) => (
            <div key={visit._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              {/* Date */}
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(visit.visitDate).toLocaleDateString()}
                </p>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">{visit.visitTime}</p>
              </div>

              {/* Project */}
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{visit.projectName}</p>
                  {visit.address && <p className="text-xs text-gray-600">{visit.address}</p>}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                    visit.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : visit.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : visit.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {visit.status}
                </span>
              </div>

              {/* Notes */}
              {visit.notes && <p className="text-xs text-gray-600 mt-2 italic">{visit.notes}</p>}

              {/* Extracted Badge */}
              {visit.extractedFromTranscript && (
                <p className="text-xs text-purple-600 mt-2">📍 Extracted from call</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
