'use client';

import React, { useState } from 'react';
import { useCreateSiteUser } from '@/hooks/useSiteUsers';
import { useProjects } from '@/hooks/useProjects';
import { X, Loader, AlertCircle } from 'lucide-react';

interface AddSiteUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddSiteUserForm: React.FC<AddSiteUserFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateSiteUser();
  const { data: projectsData, isLoading: isLoadingProjects, isError: projectsError } = useProjects();

  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    email: '',
    project_name: '',
    password: '',
  });

  const [localError, setLocalError] = useState<string>('');
  const [localSuccess, setLocalSuccess] = useState<string>('');

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
      setLocalError('Full Name is required');
      return;
    }
    if (!formData.contact_number.trim()) {
      setLocalError('Contact Number is required');
      return;
    }
    if (formData.contact_number.length < 10) {
      setLocalError('Contact Number must be at least 10 digits');
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
    if (!formData.project_name.trim()) {
      setLocalError('Project Name is required');
      return;
    }
    if (!formData.password.trim()) {
      setLocalError('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await createMutation.mutateAsync({
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        email: formData.email,
        project_name: formData.project_name,
        password: formData.password,
      });

      setLocalSuccess('Site User created successfully!');
      setTimeout(() => {
        setFormData({
          full_name: '',
          contact_number: '',
          email: '',
          project_name: '',
          password: '',
        });
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create site user';
      setLocalError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Site User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-12 space-y-6">
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

          {createMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {(createMutation.error as any)?.message || 'Failed to create site user'}
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter Full Name"
                disabled={createMutation.isPending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="+91 1234567890"
                disabled={createMutation.isPending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email ID *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email id"
                disabled={createMutation.isPending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name *
              </label>
              {isLoadingProjects && (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-gray-600 text-sm">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}

              {projectsError && !isLoadingProjects && (
                <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Failed to load</span>
                </div>
              )}

              {!isLoadingProjects && !projectsError && (
                <select
                  name="project_name"
                  value={formData.project_name}
                  onChange={(e) => {
                    handleChange({
                      target: { name: 'project_name', value: e.target.value },
                    } as any);
                  }}
                  disabled={createMutation.isPending}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-700"
                >
                  <option value="">Select Project</option>
                  {projectsData && projectsData.length > 0 ? (
                    projectsData.map((project: string) => (
                      <option key={project} value={project}>
                        {project}
                      </option>
                    ))
                  ) : (
                    <option disabled>No projects available</option>
                  )}
                </select>
              )}
            </div>

            {/* Password - Full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                disabled={createMutation.isPending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {createMutation.isPending ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
