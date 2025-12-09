'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader } from 'lucide-react';
import { usePhoneNumberOptions } from '../../hooks/usePhoneNumbers';
import { useAssistantOptions } from '../../hooks/useAssistants';
import type { Project, CreateProjectData, UpdateProjectData } from '../../types/project';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => void;
  project?: Project | null;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const ProjectFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project, 
  isLoading = false,
  mode 
}: ProjectFormModalProps) => {
  const [formData, setFormData] = useState<{
    projectName: string;
    projectStatus: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
    phoneNumberId?: string;
    assistantId?: string;
  }>({
    projectName: '',
    projectStatus: 'planning',
    phoneNumberId: '',
    assistantId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get phone number and assistant options
  const { options: phoneNumberOptions, isLoading: phoneNumbersLoading } = usePhoneNumberOptions(isOpen);
  const { options: assistantOptions, isLoading: assistantsLoading } = useAssistantOptions(isOpen);

  // Reset form when opening/closing modal
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (mode === 'edit' && project) {
          const phoneNumberId = typeof project.phoneNumberId === 'object' && project.phoneNumberId 
            ? project.phoneNumberId._id 
            : typeof project.phoneNumberId === 'string' 
              ? project.phoneNumberId 
              : '';
          
          const assistantId = typeof project.assistantId === 'object' && project.assistantId 
            ? project.assistantId._id 
            : typeof project.assistantId === 'string' 
              ? project.assistantId 
              : '';
              
          setFormData({
            projectName: project.projectName || '',
            projectStatus: project.projectStatus,
            phoneNumberId: phoneNumberId,
            assistantId: assistantId
          });
        } else {
          setFormData({
            projectName: '',
            projectStatus: 'planning',
            phoneNumberId: '',
            assistantId: ''
          });
        }
        setErrors({});
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, project]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    } else if (formData.projectName.trim().length < 3) {
      newErrors.projectName = 'Project name must be at least 3 characters';
    } else if (formData.projectName.trim().length > 100) {
      newErrors.projectName = 'Project name cannot exceed 100 characters';
    }

    if (!formData.phoneNumberId) {
      newErrors.phoneNumberId = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateProjectData | UpdateProjectData = {
      projectName: formData.projectName.trim(),
      projectStatus: formData.projectStatus,
      phoneNumberId: formData.phoneNumberId
    };

    // Add assistant if selected
    if (formData.assistantId) {
      submitData.assistantId = formData.assistantId;
    }

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Create New Project' : 'Edit Project'}
              </h3>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  placeholder="Enter project name..."
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.projectName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isLoading}
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
                )}
              </div>

              {/* Project Status */}
              <div>
                <label htmlFor="projectStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Status
                </label>
                <select
                  id="projectStatus"
                  value={formData.projectStatus}
                  onChange={(e) => handleChange('projectStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-gray-400"
                  disabled={isLoading}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <select
                  id="phoneNumberId"
                  value={formData.phoneNumberId || ''}
                  onChange={(e) => handleChange('phoneNumberId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.phoneNumberId 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isLoading || phoneNumbersLoading}
                >
                  <option value="">Select a phone number</option>
                  {phoneNumberOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.phoneNumberId && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumberId}</p>
                )}
                {phoneNumbersLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading phone numbers...</p>
                )}
                {!phoneNumbersLoading && phoneNumberOptions.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No phone numbers assigned to you</p>
                )}
              </div>

              {/* Assistant */}
              <div>
                <label htmlFor="assistantId" className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant
                </label>
                <select
                  id="assistantId"
                  value={formData.assistantId || ''}
                  onChange={(e) => handleChange('assistantId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-gray-400"
                  disabled={isLoading || assistantsLoading}
                >
                  <option value="">Select an assistant (optional)</option>
                  {assistantOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {assistantsLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading assistants...</p>
                )}
                {!assistantsLoading && assistantOptions.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No assistants found</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-green-500 to-emerald-600 border border-transparent rounded-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      {mode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {mode === 'create' ? 'Create Project' : 'Update Project'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectFormModal;