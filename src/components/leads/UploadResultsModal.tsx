'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, X, Upload, Database } from 'lucide-react';
import { CreateLeadResponse } from '../../api/leads/types';

interface UploadResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CreateLeadResponse | null;
}

const UploadResultsModal: React.FC<UploadResultsModalProps> = ({
  isOpen,
  onClose,
  results,
}) => {
  const router = useRouter();

  if (!isOpen || !results) return null;

  const handleViewLeads = () => {
    onClose();
    router.push('/dashboard/leads');
  };

  const handleUploadMore = () => {
    onClose();
    // Stay on current page
  };

  const successCount = results.validation?.summary?.successfullySaved || 0;
  const totalUploaded = results.validation?.summary?.totalUploaded || 0;
  const csvDuplicates = results.validation?.csvDuplicatesRemoved || 0;
  const dbDuplicates = results.validation?.databaseDuplicatesSkipped || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {successCount > 0 ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Results
                </h3>
                <p className="text-sm text-gray-600">
                  Processing completed - Here&apos;s what happened
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{totalUploaded}</div>
              <div className="text-xs text-blue-700 font-medium">Total Uploaded</div>
              <div className="text-xs text-blue-600 mt-1">
                <Upload className="w-3 h-3 inline mr-1" />
                From CSV File
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-xs text-green-700 font-medium">Successfully Saved</div>
              <div className="text-xs text-green-600 mt-1">
                <CheckCircle className="w-3 h-3 inline mr-1" />
                New Leads Added
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{csvDuplicates}</div>
              <div className="text-xs text-yellow-700 font-medium">CSV Duplicates</div>
              <div className="text-xs text-yellow-600 mt-1">
                <Upload className="w-3 h-3 inline mr-1" />
                Removed from File
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{dbDuplicates}</div>
              <div className="text-xs text-red-700 font-medium">Database Duplicates</div>
              <div className="text-xs text-red-600 mt-1">
                <Database className="w-3 h-3 inline mr-1" />
                Already Exists
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successCount > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  🎉 {successCount} leads saved successfully to your database!
                </span>
              </div>
            </div>
          )}

          {/* No New Leads Message */}
          {successCount === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  No new leads were added - all uploaded leads already exist in the database.
                </span>
              </div>
            </div>
          )}

          {/* Database Duplicates Details */}
          {results.validation?.databaseDuplicateDetails && results.validation.databaseDuplicateDetails.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-red-600" />
                Database Duplicates Skipped ({dbDuplicates})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {results.validation.databaseDuplicateDetails.map((duplicate, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-red-900">
                          {duplicate.name}
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          📞 {duplicate.phone} • 🏗️ {duplicate.project}
                        </div>
                        <div className="text-xs text-red-600 mt-1 italic">
                          {duplicate.reason}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Duplicate
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Why were these skipped?</strong> These leads have the same phone numbers as existing leads in the same projects in your database. Our system prevents duplicate contacts to maintain data quality.
                </p>
              </div>
            </div>
          )}

          {/* CSV Duplicates Details */}
          {results.validation?.csvDuplicateDetails && results.validation.csvDuplicateDetails.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-yellow-600" />
                CSV Duplicates Removed ({csvDuplicates})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {results.validation.csvDuplicateDetails.map((duplicate, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="font-medium text-yellow-900">
                      📞 {duplicate.phone} • 🏗️ {duplicate.project}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>CSV Cleanup:</strong> These were duplicate phone numbers within the same project in your uploaded file. We automatically removed them before processing.
                </p>
              </div>
            </div>
          )}

          {/* Final Summary */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">📋 Summary</h5>
            <p className="text-sm text-gray-700">{results.validation?.summary?.finalMessage}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleViewLeads}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>View All Leads</span>
            </button>
            <button
              onClick={handleUploadMore}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload More Leads</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadResultsModal;