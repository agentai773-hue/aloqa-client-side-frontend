'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { Lead } from '../../api/leads';

interface DeleteLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lead: Lead | null;
  isLoading?: boolean;
}

const DeleteLeadModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  lead, 
  isLoading = false 
}: DeleteLeadModalProps) => {
  if (!isOpen || !lead) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <motion.div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Lead
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this lead? This action cannot be undone.
              </p>
              
              {/* Lead Details */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Name: </span>
                    <span className="text-sm text-gray-900">{lead.fullName || lead.leadName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone: </span>
                    <span className="text-sm text-gray-900">{lead.phone}</span>
                  </div>
                  {lead.email && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email: </span>
                      <span className="text-sm text-gray-900">{lead.email}</span>
                    </div>
                  )}
                  {lead.interestedProject && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Project: </span>
                      <span className="text-sm text-gray-900">{lead.interestedProject}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Lead'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteLeadModal;