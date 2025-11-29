'use client';

import React, { useEffect } from 'react';
import { useUpdateSiteUser } from '@/hooks/useSiteUsers';
import { X } from 'lucide-react';
import { SiteUser } from '@/api/site-users';

interface EditSiteUserModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: SiteUser | null;
}

export const EditSiteUserModal: React.FC<EditSiteUserModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSuccess,
  user,
}) => {
  const updateMutation = useUpdateSiteUser();

  const [formData, setFormData] = React.useState({
    full_name: '',
    email: '',
    contact_number: '',
    project_name: '',
    password: '',
  });

  const [localError, setLocalError] = React.useState<string>('');
  const [localSuccess, setLocalSuccess] = React.useState<string>('');

  // Set form data when user loads
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        contact_number: user.contact_number,
        project_name: user.project_name || '',
        password: '',
      });
      setLocalError('');
      setLocalSuccess('');
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
    setLocalSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    // Validation
    if (!formData.full_name.trim()) {
      setLocalError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setLocalError('Please provide a valid email address');
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
    if (!formData.project_name.trim()) {
      setLocalError('Project name is required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: userId,
        data: {
          full_name: formData.full_name,
          email: formData.email,
          contact_number: formData.contact_number,
          project_name: formData.project_name,
          ...(formData.password && { password: formData.password }),
        },
      });

      setLocalSuccess('Site user updated successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update site user';
      setLocalError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Site User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {localError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {localError}
            </div>
          )}

          {localSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {localSuccess}
            </div>
          )}

          {updateMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {(updateMutation.error as any)?.message || 'Failed to update site user'}
            </div>
          )}

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
                required
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
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
                required
                placeholder="Enter contact number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                required
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (leave blank to keep current)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateMutation.isPending}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
