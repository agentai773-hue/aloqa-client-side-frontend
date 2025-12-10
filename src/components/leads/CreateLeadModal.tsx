'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Target, Mail, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { leadsAPI } from '../../api/leads';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projects: Project[]; // Pass projects as prop
}

interface LeadFormData {
  // Mandatory fields
  leadName: string;
  phone: string;
  interestedProject: string;
  // Optional fields
  fullName: string;
  email: string;
  location: string;
  notes: string;
}

interface Project {
  id: string;
  name: string;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose, onSuccess, projects }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    // Mandatory
    leadName: '',
    phone: '',
    interestedProject: '',
    // Optional
    fullName: '',
    email: '',
    location: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string>('');



  // Reset form when modal closes
  const resetForm = () => {
    setFormData({
      // Mandatory
      leadName: '',
      phone: '',
      interestedProject: '',
      // Optional
      fullName: '',
      email: '',
      location: '',
      notes: ''
    });
    setErrors({});
    setBackendError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's 10 digits
    return cleanPhone.length === 10;
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.leadName.trim()) {
      newErrors.leadName = 'Lead name is required';
    } else if (formData.leadName.trim().length < 2) {
      newErrors.leadName = 'Lead name must be at least 2 characters';
    } else if (formData.leadName.trim().length > 50) {
      newErrors.leadName = 'Lead name cannot exceed 50 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.interestedProject) {
      newErrors.interestedProject = 'Project is required';
    }

    // Optional fields validation
    if (formData.fullName && formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Full name cannot exceed 100 characters';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.location && formData.location.trim().length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    if (formData.notes && formData.notes.trim().length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous backend error
    setBackendError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare lead data with defaults
      const leadData = {
        // Required fields
        leadName: formData.leadName.trim(),
        fullName: formData.fullName.trim() || formData.leadName.trim(), // Use fullName if provided, else leadName
        phone: formData.phone.replace(/\D/g, ''), // Clean phone number
        interestedProject: formData.interestedProject,
        
        // Optional fields
        email: formData.email.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        leadType: 'cold' as const, // Default to cold
        
        // Call information defaults
        call_status: 'pending' as const,
        call_attempt_count: 0,
        max_retry_attempts: 3,
        call_disposition: undefined,
        next_scheduled_call_time: undefined,
        
        // Find project ID
        projectId: projects.find(p => p.name === formData.interestedProject)?.id
      };

      const response = await leadsAPI.create(leadData);


      if (response.success) {
        toast.success('Lead created successfully!');
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        // Handle API response errors
        const errorMessage = response.message || 'Failed to create lead';
        setBackendError(errorMessage);
        
        // Show error in toast with better formatting
        if (errorMessage.includes('already exists')) {
          toast.error(
            `⚠️ Duplicate Lead\n${errorMessage}`,
            { 
              duration: 5000,
              style: {
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                zIndex: 1000,
              }
            }
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: unknown) {
      console.error('Error creating lead:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create lead. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        // Backend error with structured response
        const axiosError = error as { response: { data: { error?: string; message?: string; errors?: Array<{ msg: string }> } } };
        const backendError = axiosError.response.data;
        
        if (backendError.error) {
          // Direct error message from backend
          errorMessage = backendError.error;
        } else if (backendError.message) {
          // General message from backend
          errorMessage = backendError.message;
        } else if (backendError.errors && Array.isArray(backendError.errors)) {
          // Validation errors array
          errorMessage = backendError.errors.map((err) => err.msg).join(', ');
        }
      } else if (error instanceof Error && error.message) {
        // Network or other errors
        errorMessage = error.message;
      }
      
      // Set backend error for display in modal
      setBackendError(errorMessage);
      
      // Show error in toast with better formatting
      if (errorMessage.includes('already exists')) {
        toast.error(
          `⚠️ Duplicate Lead\n${errorMessage}`,
          { 
            duration: 5000,
            style: {
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#dc2626'
            }
          }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2 text-green-600" />
              Add New Lead
            </h3>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Required Fields Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Required Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead Name */}
                <div>
                  <label htmlFor="leadName" className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="leadName"
                      name="leadName"
                      value={formData.leadName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.leadName 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter lead name"
                      required
                    />
                  </div>
                  {errors.leadName && (
                    <p className="mt-1 text-sm text-red-600">{errors.leadName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.phone 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                  {errors.phone ? (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">Enter 10-digit phone number without spaces</p>
                  )}
                </div>
              </div>

              {/* Project - Full Width */}
              <div className="mt-6">
                <label htmlFor="interestedProject" className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    id="interestedProject"
                    name="interestedProject"
                    value={formData.interestedProject}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none bg-white ${
                      errors.interestedProject 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.interestedProject && (
                  <p className="mt-1 text-sm text-red-600">{errors.interestedProject}</p>
                )}
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Additional Information (Optional)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.fullName 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter full name (optional)"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.email 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter email address (optional)"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.location 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter location (optional)"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Notes - Full Width */}
              <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${
                      errors.notes 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter any additional notes (optional)"
                  />
                </div>
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {500 - formData.notes.length} characters remaining
                </p>
              </div>
            </div>

            {/* Backend Error Display */}
            {backendError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">
                      Error Creating Lead
                    </h4>
                    <p className="mt-1 text-sm text-red-600 whitespace-pre-line">
                      {backendError}
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      type="button"
                      onClick={() => setBackendError('')}
                      className="inline-flex text-red-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Lead
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateLeadModal;