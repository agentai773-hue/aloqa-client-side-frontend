'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, User, Phone, Target, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead, type Lead } from '../../api/leads-api';
import { projectsAPI } from '../../api/projects';

// Local interface for project data that might have either field name
interface ProjectResponse {
  _id: string;
  name?: string;
  projectName?: string;
  [key: string]: unknown;
}

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface LeadFormData {
  leadName: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  interestedProject: string;
  leadType: 'fake' | 'cold' | 'hot';
  notes: string;
  // Call-related fields
  call_status: 'pending' | 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'no_answer' | 'failed' | 'voicemail' | 'busy' | 'cancelled';
  call_attempt_count: number;
  max_retry_attempts: number;
  call_disposition?: 'interested' | 'not_interested' | 'site_visit_scheduled' | 'callback_requested' | 'wrong_number' | 'language_barrier' | 'voicemail' | 'no_answer';
  next_scheduled_call_time?: string;
}

interface Project {
  id: string;
  name: string;
  keywords?: string[];
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    leadName: '',
    fullName: '',
    phone: '',
    email: '',
    location: '',
    interestedProject: '',
    leadType: 'cold',
    notes: '',
    // Call-related field defaults
    call_status: 'pending',
    call_attempt_count: 0,
    max_retry_attempts: 3,
    call_disposition: undefined,
    next_scheduled_call_time: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isOpen) return; // Only fetch when modal is open
      
      setLoadingProjects(true);
      try {
        const response = await projectsAPI.getAll();
        
        if (response.success && response.data && response.data.projects && response.data.projects.length > 0) {
          const projects = response.data.projects;
          const apiProjects = projects.map((project: unknown, index: number) => {
            // Safely extract project data
            const projectData = project as ProjectResponse;
            return {
              id: projectData._id || `project-${index}`,
              name: projectData.projectName || projectData.name || 'Unnamed Project',
              keywords: []
            };
          });
          setProjects(apiProjects);
        } else {
          setProjects([]);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch projects:', error);
        const errorData = error as { message?: string; response?: { status?: number; data?: unknown } };
        console.error('Error details:', {
          message: errorData?.message,
          response: errorData?.response,
          status: errorData?.response?.status,
          data: errorData?.response?.data
        });
        // Remove static fallback data - just set empty array
        setProjects([]);
        toast.error('Failed to fetch projects. Please check your connection or contact support.');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (name === 'call_attempt_count' || name === 'max_retry_attempts') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
      return;
    }
    
    // Handle optional string fields that can be undefined
    if (name === 'call_disposition' && value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: undefined
      }));
      return;
    }
    
    if (name === 'next_scheduled_call_time' && value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: undefined
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.leadName || !formData.email || !formData.interestedProject || !formData.leadType) {
        toast.error('Please fill in all required fields: Lead Name, Email Address, Interested Project, and Lead Type');
        setIsSubmitting(false);
        return;
      }

      const leadData: Lead = {
        ...formData,
        projectId: projects.find(p => p.name === formData.interestedProject)?.id
      };

      const response = await createLead(leadData);

      if (response.success) {
        toast.success('Lead created successfully!');
        setFormData({
          leadName: '',
          fullName: '',
          phone: '',
          email: '',
          location: '',
          interestedProject: '',
          leadType: 'cold',
          notes: '',
          // Reset call-related fields
          call_status: 'pending',
          call_attempt_count: 0,
          max_retry_attempts: 3,
          call_disposition: undefined,
          next_scheduled_call_time: undefined
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeadTypeColor = (leadType: string) => {
    switch (leadType) {
      case 'hot': return 'from-red-400 to-red-600';
      case 'fake': return 'from-gray-400 to-gray-600';
      case 'cold': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Create New Lead</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 text-green-600 mr-2" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-600 mb-2">
                        Lead Name *
                      </label>
                      <input
                        type="text"
                        name="leadName"
                        value={formData.leadName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter lead name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter full name (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Phone className="w-5 h-5 text-green-600 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter phone number (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-600 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter location (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Project & Interest */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    Project & Interest
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-600 mb-2">
                        Interested Project *
                      </label>
                      <select
                        name="interestedProject"
                        value={formData.interestedProject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={loadingProjects}
                      >
                        <option value="">{loadingProjects ? 'Loading projects...' : 'Select a project'}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.name}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
                    Lead Classification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-600 mb-2">
                        Lead Type *
                      </label>
                      <select
                        name="leadType"
                        value={formData.leadType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="fake">Fake</option>
                        <option value="cold">Cold</option>
                        <option value="hot">Hot</option>
                      </select>
                      <div className={`mt-1 h-2 rounded-full bg-linear-to-r ${getLeadTypeColor(formData.leadType)}`}></div>
                    </div>
                  </div>
                </div>

                {/* Call Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    Call Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call Status
                      </label>
                      <select
                        name="call_status"
                        value={formData.call_status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="initiating">Initiating</option>
                        <option value="ringing">Ringing</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="no_answer">No Answer</option>
                        <option value="failed">Failed</option>
                        <option value="voicemail">Voicemail</option>
                        <option value="busy">Busy</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attempt Count
                      </label>
                      <input
                        type="number"
                        name="call_attempt_count"
                        value={formData.call_attempt_count}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Retry Attempts
                      </label>
                      <input
                        type="number"
                        name="max_retry_attempts"
                        value={formData.max_retry_attempts}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call Disposition
                      </label>
                      <select
                        name="call_disposition"
                        value={formData.call_disposition || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select disposition (optional)</option>
                        <option value="interested">Interested</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="site_visit_scheduled">Site Visit Scheduled</option>
                        <option value="callback_requested">Callback Requested</option>
                        <option value="wrong_number">Wrong Number</option>
                        <option value="language_barrier">Language Barrier</option>
                        <option value="voicemail">Voicemail</option>
                        <option value="no_answer">No Answer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Next Scheduled Call
                      </label>
                      <input
                        type="datetime-local"
                        name="next_scheduled_call_time"
                        value={formData.next_scheduled_call_time || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    Additional Notes
                  </h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Add any additional notes about this lead..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Create Lead</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateLeadModal;