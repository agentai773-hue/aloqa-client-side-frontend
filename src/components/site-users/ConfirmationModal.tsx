'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm mx-4 animate-in">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
              isDangerous
                ? 'bg-red-100'
                : 'bg-yellow-100'
            }`}
          >
            <AlertCircle
              className={`h-6 w-6 ${
                isDangerous
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {confirmText}
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
