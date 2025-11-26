'use client';

import React, { useState, useRef } from 'react';
import { useImportLeads } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuthRedux';
import Papa from 'papaparse';

export const ImportLeadsCSV: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const importMutation = useImportLeads();
  const loading = importMutation.isPending;
  const error = importMutation.isError ? (importMutation.error as any)?.message : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>('');
  const [localSuccess, setLocalSuccess] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importProgress, setImportProgress] = useState<{
    total: number;
    processed: number;
  } | null>(null);
  const [importMeta, setImportMeta] = useState<{
    skippedDuplicatesInCSV?: string[];
    skippedExistingInDB?: string[];
    invalidRows?: Array<any>;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileName('');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setLocalError('Please select a CSV file');
      return;
    }

    setFileName(file.name);
    setLocalError('');
    setLocalSuccess('');
  };

  // Mapping of common CSV column names to backend field names
  const columnMapping: Record<string, string> = {
    'name': 'full_name',
    'Name': 'full_name',
    'full_name': 'full_name',
    'Full Name': 'full_name',
    'phone': 'contact_number',
    'Phone': 'contact_number',
    'contact_number': 'contact_number',
    'Contact Number': 'contact_number',
    'Contact': 'contact_number',
    'status': 'call_status',
    'Status': 'call_status',
    'call_status': 'call_status',
    'Call Status': 'call_status',
    'project_name': 'project_name',
    'Project Name': 'project_name',
    'project-name': 'project_name',
    'Project': 'project_name',
    'lead_type': 'lead_type',
    'Lead Type': 'lead_type',
    'Type': 'lead_type',
    'priority': 'lead_type',
    'Priority': 'lead_type',
  };

  // Mapping of CSV values to backend enum values
  const valueMapping: Record<string, Record<string, string>> = {
    'lead_type': {
      'high': 'hot',
      'High': 'hot',
      'HIgh': 'hot',
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

  const parseCSV = (file: File): Promise<Array<Record<string, any>>> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Map CSV columns to backend field names and extract only required fields
          const mappedData = (results.data as Array<Record<string, any>>).map((row) => {
            const mappedRow: Record<string, any> = {};

            for (const [csvKey, value] of Object.entries(row)) {
              // Find the mapped backend field name
              const backendField = columnMapping[csvKey] || csvKey;
              
              // Only include these fields: full_name, contact_number, lead_type, call_status, project_name
              if (['full_name', 'contact_number', 'lead_type', 'call_status', 'project_name'].includes(backendField)) {
                // Skip empty values
                if (value && String(value).trim()) {
                  let finalValue = String(value).trim();
                  
                  // Map enum values for lead_type and call_status
                  if (backendField === 'lead_type' || backendField === 'call_status') {
                    finalValue = mapValue(backendField, finalValue);
                  }
                  
                  mappedRow[backendField] = finalValue;
                }
              }
            }

            return mappedRow;
          });

          resolve(mappedData);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setLocalError('Please select a CSV file');
      return;
    }

    try {
      setLocalError('');
      setLocalSuccess('');
      const data = await parseCSV(file);

      if (data.length === 0) {
        setLocalError('CSV file is empty');
        return;
      }

      // Validate required columns
      const requiredColumns = ['full_name', 'contact_number', 'lead_type'];
      const csvHeaders = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(
        (col) => !csvHeaders.includes(col)
      );

      if (missingColumns.length > 0) {
        setLocalError(
          `Missing required columns: ${missingColumns.join(', ')}`
        );
        return;
      }

      // Do not block on CSV duplicates here; backend will skip duplicates and return meta

      setImportProgress({ total: data.length, processed: 0 });

      const result = await importMutation.mutateAsync(data as any);
      
      setLocalSuccess(`Successfully imported ${result.data?.leads?.length || data.length} leads from CSV!`);
      setImportMeta(result.data?.meta || null);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImportProgress(null);
      setTimeout(() => setLocalSuccess(''), 4000);
    } catch (err: any) {
      setLocalError(
        err.message || 'Error parsing CSV file. Please check the format.'
      );
      setImportProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        setFileName(file.name);
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
        setLocalError('');
      } else {
        setLocalError('Please drop a CSV file');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Import Leads from CSV</h2>

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

      {importMeta && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded">
          <h4 className="font-semibold mb-2">Import Summary</h4>
          {importMeta.skippedDuplicatesInCSV && importMeta.skippedDuplicatesInCSV.length > 0 && (
            <p className="text-sm">Skipped duplicate numbers in CSV: {importMeta.skippedDuplicatesInCSV.join(', ')}</p>
          )}
          {importMeta.skippedExistingInDB && importMeta.skippedExistingInDB.length > 0 && (
            <p className="text-sm">Skipped existing numbers in DB: {importMeta.skippedExistingInDB.join(', ')}</p>
          )}
          {importMeta.invalidRows && importMeta.invalidRows.length > 0 && (
            <p className="text-sm">Invalid rows skipped: {importMeta.invalidRows.length} (check server response)</p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Required columns: <code className="bg-white px-1">full_name</code>, <code className="bg-white px-1">contact_number</code>, <code className="bg-white px-1">lead_type</code></li>
          <li>✓ Optional columns: <code className="bg-white px-1">call_status</code>, <code className="bg-white px-1">project_name</code></li>
          <li>✓ Lead type values: pending, hot, cold, fake, connected</li>
          <li>✓ Call status values: pending, connected, not_connected, callback</li>
          <li className="text-red-700 font-semibold">⚠ Note: Only these 5 fields will be imported. Other columns are ignored.</li>
          <li className="text-red-700 font-semibold">⚠ Duplicate Check: Phone numbers must be unique within CSV and not already exist in database</li>
        </ul>
        <h3 className="font-semibold text-blue-900 mt-4 mb-2">Column Mapping (automatic):</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <code className="bg-white px-1">Name</code> or <code className="bg-white px-1">Full Name</code> → <code className="bg-white px-1">full_name</code></li>
          <li>• <code className="bg-white px-1">Phone</code> or <code className="bg-white px-1">Contact</code> → <code className="bg-white px-1">contact_number</code></li>
          <li>• <code className="bg-white px-1">Status</code> → <code className="bg-white px-1">call_status</code> (pending/connected/not_connected/callback)</li>
          <li>• <code className="bg-white px-1">Priority</code> → <code className="bg-white px-1">lead_type</code> (pending/hot/cold/fake/connected)</li>
          <li>• <code className="bg-white px-1">Project Name</code> or <code className="bg-white px-1">project-name</code> → <code className="bg-white px-1">project_name</code></li>
        </ul>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 bg-gray-50 hover:border-blue-500 transition-colors"
      >
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-gray-600 mb-2">
            Drag and drop your CSV file here or click to browse
          </p>
          <p className="text-xs text-gray-500">Supported format: CSV</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </div>

      {/* File Input Button */}
      <div className="mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Choose File
        </button>
      </div>

      {/* Selected File Info */}
      {fileName && (
        <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Selected file:</span> {fileName}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {importProgress && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Processing: {importProgress.processed} / {importProgress.total}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(importProgress.processed / importProgress.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Import Button */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setFileName('');
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          disabled={loading || !fileName}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
        <button
          onClick={handleImport}
          disabled={loading || !fileName}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing...' : 'Import Leads'}
        </button>
      </div>

      {/* Sample CSV Download */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Need a sample? Download template:</p>
        <button
          onClick={() => {
            const template =
              'Name,Phone,Status,Priority,project_name\nJohn Doe,9876543210,pending,High,Project A\nJane Smith,9765432109,connected,Medium,Project B\nRajesh Kumar,8765432109,hot,Low,Project C';
            const element = document.createElement('a');
            element.setAttribute(
              'href',
              `data:text/csv;charset=utf-8,${encodeURIComponent(template)}`
            );
            element.setAttribute('download', 'leads_template.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Download Sample CSV
        </button>
      </div>
    </div>
  );
};
