'use client';

import React, { useRef, useState } from 'react';
import { useCreateLead } from '@/hooks/useLeads';
import { Upload, AlertCircle, ChevronLeft } from 'lucide-react';
import Papa from 'papaparse';
import Link from 'next/link';

export default function MultipleLeadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createLeadMutation = useCreateLead();
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<string>('');

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: false,
      complete: async (results) => {
        try {
          const parsedLeads = results.data
            .filter((row: any) => {
              // Normalize column names - check all possible variations
              const nameValue = (row.Name || row.name || row.full_name || row.username || '').toString().trim();
              const phoneValue = (row.phone || row.Phone || row.contact_number || row.phone_number || '').toString().trim();
              
              return nameValue || phoneValue;
            })
            .map((row: any) => {
              // Extract values from all possible column name variations
              const fullName = (row.Name || row.name || row.full_name || row.username || '').toString().trim();
              const phoneNumber = (row.phone || row.Phone || row.contact_number || row.phone_number || '').toString().trim();
              const leadType = (row.Priority || row.priority || row.lead_type || 'pending').toString().trim();
              const callStatus = (row.Status || row.status || row.call_status || 'pending').toString().trim();
              const projectName = (row.project || row.Project || row.project_name || '').toString().trim();
              
              return {
                full_name: fullName,
                contact_number: phoneNumber,
                lead_type: mapLeadType(leadType),
                call_status: mapCallStatus(callStatus),
                project_name: projectName,
              };
            })
            .filter((lead: any) => lead.full_name || lead.contact_number);

          if (parsedLeads.length === 0) {
            setImportError('No valid leads found in CSV file');
            return;
          }

          // Create leads one by one
          let successCount = 0;
          let failureCount = 0;
          const failedLeads: string[] = [];

          for (const lead of parsedLeads) {
            try {
              await createLeadMutation.mutateAsync(lead);
              successCount++;
            } catch (err: any) {
              const errorMessage = err.response?.data?.error || err.message || '';
              const isDuplicate = errorMessage.includes('already exists');
              
              if (!isDuplicate) {
                failureCount++;
                failedLeads.push(`${lead.full_name} (${lead.contact_number})`);
              }
            }
          }

          if (successCount > 0) {
            let message = `✓ Successfully imported ${successCount} leads!`;
            if (failureCount > 0) {
              message += ` (${failureCount} failed)`;
            }
            setImportSuccess(message);
          } else {
            setImportError('Failed to import any leads');
          }
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          setTimeout(() => setImportSuccess(''), 5000);
        } catch (error: any) {
          setImportError(
            error.response?.data?.error || error.message || 'Failed to import leads'
          );
        }
      },
      error: (error: any) => {
        setImportError(`CSV parsing error: ${error.message}`);
      },
    });
  };

  const mapLeadType = (value: string): any => {
    const mapping: Record<string, any> = {
      pending: 'pending',
      hot: 'hot',
      cold: 'cold',
      fake: 'fake',
      connected: 'connected',
      high: 'hot',
      medium: 'connected',
      low: 'cold',
    };
    return mapping[value.toLowerCase()] || 'pending';
  };

  const mapCallStatus = (value: string): any => {
    const mapping: Record<string, any> = {
      pending: 'pending',
      connected: 'connected',
      not_connected: 'not_connected',
      callback: 'callback',
      new: 'pending',
      hot: 'connected',
      cold: 'not_connected',
    };
    return mapping[value.toLowerCase()] || 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        {/* <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-[#34DB17] hover:text-[#306B25] font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Leads
        </Link> */}

        {/* Title Section - Outside Box */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900">Import CSV File</h1>
          <p className="text-gray-600 mt-3 text-lg">Upload your .csv file to import data into the system.</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Content */}
          <div className="p-8 sm:p-12">
            {importError && (
              <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold">Import Error</p>
                  <p className="text-sm">{importError}</p>
                </div>
              </div>
            )}

            {importSuccess && (
              <div className="mb-8 p-5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
                <span className="text-xl">✓</span>
                <span className="font-medium">{importSuccess}</span>
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-[#34DB17] bg-green-50 rounded-xl p-12 sm:p-16 text-center mb-8">
              <Upload className="h-16 w-16 text-[#34DB17] mx-auto mb-4" />
              <p className="text-gray-900 font-bold text-lg mb-2">Drop your Excel file here</p>
              <p className="text-gray-600 text-base mb-8">or</p>
              
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
                className="px-8 py-3 bg-linear-to-r from-[#34DB17] to-[#306B25] text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-bold text-base transition-all"
              >
                {createLeadMutation.isPending ? 'Importing...' : 'Browse File .csv'}
              </button>
              {/* <p className="text-gray-500 text-sm mt-4">Maximum file size: 5MB</p> */}
            </div>

            {/* Buttons */}
            <div className="flex gap-6">
              <Link
                href="/leads"
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-center text-base"
              >
                Cancel
              </Link>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={createLeadMutation.isPending}
                className="flex-1 px-8 py-4 bg-linear-to-r from-[#34DB17] to-[#306B25] text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all text-base"
              >
                {createLeadMutation.isPending ? 'Importing...' : 'Import File'}
              </button>
            </div>

            {createLeadMutation.isError && (
              <div className="mt-6 p-5 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-semibold">Error importing leads</p>
                <p className="text-sm">
                  {(createLeadMutation.error as any)?.message || 'Failed to import leads'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
