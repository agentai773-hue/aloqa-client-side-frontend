'use client';

import React, { useState, useRef } from 'react';
import { useImportLeads } from '@/hooks/useLeads';
import Papa from 'papaparse';
import type { Lead } from '@/api/leads/types';

// Define type for CSV row
interface CSVRow {
  [key: string]: string;
}

export const ImportLeadsCSV: React.FC = () => {
  const importMutation = useImportLeads();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [localError, setLocalError] = useState<string>('');
  const [localSuccess, setLocalSuccess] = useState<string>('');
  const [importProgress, setImportProgress] = useState<{ total: number; processed: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setLocalError('Please select a CSV file');
      return;
    }

    setFileName(file.name);
    setLocalError('');
    setLocalSuccess('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const csvData = results.data as CSVRow[];
          
          if (csvData.length === 0) {
            setLocalError('CSV file is empty');
            return;
          }

          // Transform CSV data to Lead objects
          const data: Lead[] = csvData.map(row => ({
            leadName: row.leadName || row.name || '',
            fullName: row.fullName || row.name || '',
            phone: row.phone || row.phoneNumber || '',
            email: row.email || '',
            location: row.location || '',
            interestedProject: row.interestedProject || row.project || '',
            leadType: (row.leadType as Lead['leadType']) || 'cold',
            notes: row.notes || ''
          }));

          setImportProgress({ total: data.length, processed: 0 });

          const result = await importMutation.mutateAsync(data);
          
          setLocalSuccess(`Successfully imported ${result.length} leads from CSV!`);
          setFileName('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setImportProgress(null);
          setTimeout(() => setLocalSuccess(''), 4000);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error processing CSV file';
          setLocalError(errorMessage);
          setImportProgress(null);
        }
      },
      error: (error) => {
        setLocalError(`CSV parsing error: ${error.message}`);
        setImportProgress(null);
      }
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        setFileName(file.name);
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
        setLocalError('');
        await processFile(file);
      } else {
        setLocalError('Please drop a CSV file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Import Leads from CSV</h2>

      {localError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {localError}
        </div>
      )}

      {localSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
          {localSuccess}
        </div>
      )}

      {importProgress && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded">
          Importing leads: {importProgress.processed}/{importProgress.total}
        </div>
      )}

      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Drag and drop your CSV file here, or click to select</p>
          {fileName && <p className="text-sm text-gray-500">Selected: {fileName}</p>}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />
        
        <label
          htmlFor="csv-file-input"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Choose CSV File
        </label>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">CSV Format Requirements:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Must be a .csv file</li>
          <li>• Required columns: fullName, email</li>
          <li>• Optional columns: phone, location, leadType, interestedProject, notes</li>
          <li>• First row should contain column headers</li>
        </ul>
      </div>
    </div>
  );
};
