'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, Save, Download, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { leadsAPI } from '../../../../api/leads';
import { projectsAPI } from '../../../../api/projects';
import CreateLeadModal from '../../../../components/leads/CreateLeadModal';

// Local interface for project data that might have either field name
interface ProjectResponse {
  _id: string;
  name?: string;
  projectName?: string;
  [key: string]: unknown;
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
  status: 'new' | 'old';
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface Project {
  id: string;
  name: string;
  keywords?: string[];
}

// Fuzzy project matching function
const findBestProjectMatch = (inputProject: string, projects: Project[]): Project | null => {
  const input = inputProject.toLowerCase().trim();
  
  // Exact match first
  const exactMatch = projects.find(p => 
    p.name.toLowerCase() === input
  );
  if (exactMatch) return exactMatch;

  // Keyword match
  const keywordMatch = projects.find(p => 
    p.keywords?.some(keyword => 
      keyword.toLowerCase().includes(input) || input.includes(keyword.toLowerCase())
    )
  );
  if (keywordMatch) return keywordMatch;

  // Partial name match
  const partialMatch = projects.find(p => 
    p.name.toLowerCase().includes(input) || input.includes(p.name.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  return null;
};

interface LeadPreview extends LeadFormData {
  _id: string;
  projectId?: string;
  userId?: string;
  matchedProject?: Project;
}

export default function AddLeadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewLeads, setPreviewLeads] = useState<LeadPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.getAll();
        console.log('Projects API Response:', response); // Debug log
        
        if (response.success && response.data && response.data.projects && response.data.projects.length > 0) {
          const projects = response.data.projects;
          const apiProjects = projects.map((project, index) => {
            // Safely extract project data
            const projectData = project as unknown as ProjectResponse;
            return {
              id: projectData._id || `project-${index}`,
              name: projectData.projectName || projectData.name || 'Unnamed Project',
              keywords: []
            };
          });
          setProjects(apiProjects);
          console.log('✅ Projects loaded successfully (Add Page):', apiProjects.length, 'projects');
        } else {
          console.warn('No projects data found in response:', response);
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
      }
    };

    fetchProjects();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file type (accept CSV, Excel, text files)
      const allowedTypes = [
        'text/csv', 
        'application/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast.error(`File ${file.name} is not a supported format. Please use CSV, Excel, or text files.`);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          content: result
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        // Process the file immediately
        processFileContent(result);
      };
      
      reader.readAsText(file);
    });

    // Clear the input value so the same file can be uploaded again
    if (e.target) {
      e.target.value = '';
    }
  };

  const processFileContent = (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast.error('File must contain at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1);

      if (dataRows.length === 0) {
        toast.error('No data rows found in the file');
        return;
      }

      console.log(`📊 Processing ${dataRows.length} rows from CSV`);

      const parsedLeads: LeadPreview[] = [];

      dataRows.forEach((row, index) => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < headers.length) {
          console.warn(`⚠️ Row ${index + 2} has fewer values than headers`);
          return;
        }

        const leadData: Record<string, string> = {};
        headers.forEach((header, i) => {
          leadData[header] = values[i] || '';
        });

        // Map CSV fields to our lead structure
        const fullLead: LeadPreview = {
          _id: `temp_${Math.random().toString(36).substr(2, 9)}`,
          leadName: leadData.name || leadData.lead_name || leadData.leadname || '',
          fullName: leadData.name || leadData.full_name || leadData.fullname || '',
          phone: leadData.phone || leadData.contact || leadData.phone_number || '',
          email: leadData.email || leadData.email_address || '',
          location: leadData.location || leadData.address || leadData.city || '',
          interestedProject: leadData.project || leadData.interested_project || leadData.project_name || '',
          leadType: (['fake', 'cold', 'hot'].includes(leadData.lead_type?.toLowerCase()) 
            ? leadData.lead_type.toLowerCase() : 'cold') as 'fake' | 'cold' | 'hot',
          notes: leadData.notes || leadData.comments || leadData.description || '',
          status: (['new', 'old'].includes(leadData.status?.toLowerCase()) 
            ? leadData.status.toLowerCase() : 'old') as 'new' | 'old',
        };

        // Skip empty or invalid leads
        if (!fullLead.fullName && !fullLead.phone) {
          console.warn(`⚠️ Skipping row ${index + 2}: Missing name and phone`);
          return;
        }

        // Project matching
        if (fullLead.interestedProject) {
          const projectMatch = findBestProjectMatch(fullLead.interestedProject, projects);
          if (projectMatch) {
            fullLead.interestedProject = projectMatch.name;
            fullLead.projectId = projectMatch.id;
            fullLead.matchedProject = projectMatch;
            console.log(`✅ Project matched: "${leadData.interestedProject}" → "${projectMatch.name}" (ID: ${projectMatch.id})`);
          } else {
            console.log(`⚠️ No project match found for: "${fullLead.interestedProject}"`);
          }
        }

        // Generate User ID (would come from auth context)
        fullLead.userId = `USER_${Math.random().toString(36).substr(2, 9)}`;

        parsedLeads.push(fullLead);
      });

      // Remove duplicates by phone number, keep only one per project
      const deduplicatedLeads = removeDuplicates(parsedLeads);
      
      setPreviewLeads(deduplicatedLeads);
      toast.success(`Processed ${dataRows.length} leads, ${deduplicatedLeads.length} unique leads after deduplication`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file content');
    }
  };

  // Deduplication function
  const removeDuplicates = (leads: LeadPreview[]): LeadPreview[] => {
    const uniqueLeads: LeadPreview[] = [];
    const seenPhones = new Set<string>();
    const projectPhonePairs = new Set<string>();

    leads.forEach(lead => {
      const phoneKey = lead.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      const projectPhoneKey = `${lead.projectId || 'no-project'}_${phoneKey}`;

      // Skip if we've seen this phone number before
      if (seenPhones.has(phoneKey)) {
        console.log(`⚠️ Duplicate phone number skipped: ${lead.phone}`);
        return;
      }

      // Skip if we've seen this phone-project combination before
      if (projectPhonePairs.has(projectPhoneKey)) {
        console.log(`⚠️ Duplicate phone-project combination skipped: ${lead.phone} for project ${lead.interestedProject}`);
        return;
      }

      seenPhones.add(phoneKey);
      projectPhonePairs.add(projectPhoneKey);
      uniqueLeads.push(lead);
    });

    return uniqueLeads;
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Manual Add Button */}
      <motion.div
        className="bg-linear-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📈 Lead Management</h1>
            <p className="text-white/90">Add leads manually or upload CSV files</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Manual Lead</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* File Upload Section */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Upload Lead Data</h2>
        
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-700 mb-2">📋 Expected File Format</h3>
          <p className="text-sm text-gray-700 mb-2">Your CSV file should contain these columns:</p>
          <div className="text-xs text-green-700 font-mono bg-green-100 p-2 rounded">
            Name, Phone, Email, Location, Project, Lead Type, Status, Notes
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 Projects will be automatically matched with existing ones in the system
          </p>
          <div className="mt-3">
            <a
              href="/sample-leads.csv"
              download="sample-leads.csv"
              className="inline-flex items-center text-xs text-green-600 hover:text-green-500 underline"
            >
              <Download className="w-3 h-3 mr-1" />
              Download Sample CSV
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
          >
            <Upload className="mx-auto h-12 w-12 text-green-500" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">Upload CSV or Excel file</p>
              <p className="text-sm text-gray-600">
                Drag and drop or click to browse files
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: CSV, Excel, TXT (Max 10MB)
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Uploaded Files</h3>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview Section */}
      {previewLeads.length > 0 && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📋 Lead Preview ({previewLeads.length} leads)
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewLeads([])}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear Preview
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              🔍 <strong>Deduplication Applied:</strong> Removed duplicate phone numbers and duplicate phone-project combinations.
            </p>
            <p className="text-sm text-gray-700 mt-1">
              ✅ <strong>Project Matching:</strong> Projects automatically matched with existing system projects.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Phone</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Project</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Lead Type</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{lead.fullName}</div>
                        <div className="text-gray-500 text-xs">{lead.location}</div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {lead.phone}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {lead.email}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="text-gray-900">{lead.interestedProject}</div>
                        {lead.matchedProject && (
                          <div className="text-xs text-green-600">✅ ID: {lead.projectId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                        lead.leadType === 'hot' ? 'bg-red-100 text-red-800' :
                        lead.leadType === 'cold' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.leadType}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                        lead.status === 'new' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviewLeads = previewLeads.filter(l => l._id !== lead._id);
                          setPreviewLeads(newPreviewLeads);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remove from preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsSubmitting(true);
                  await leadsAPI.createBulk(previewLeads);
                  toast.success(`Successfully created ${previewLeads.length} leads!`);
                  setPreviewLeads([]);
                  setUploadedFiles([]);
                  router.push('/dashboard/leads');
                } catch (error) {
                  console.error('Error submitting leads:', error);
                  toast.error('Failed to create leads. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting || previewLeads.length === 0}
              className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving Leads...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Submit {previewLeads.length} Leads</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Lead Creation Modal */}
      <CreateLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh the leads list or navigate
          router.push('/dashboard/leads');
        }}
      />
    </div>
  );
}