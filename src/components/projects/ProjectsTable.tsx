'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Pause,
  XCircle
} from 'lucide-react';
import Pagination from '../ui/Pagination';
import type { Project } from '../../types/project';

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void;
  // Pagination props - same as leads
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const ProjectsTable = ({ 
  projects, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: ProjectsTableProps) => {

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'planning': {
        icon: Clock,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Planning'
      },
      'in-progress': {
        icon: CheckCircle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'In Progress'
      },
      'on-hold': {
        icon: Pause,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'On Hold'
      },
      'completed': {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed'
      },
      'cancelled': {
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
        label: 'Cancelled'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config?.className || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config?.label || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getClientName = (userId: Project['userId']) => {
    if (typeof userId === 'string') {
      return 'Unknown Client';
    }
    return `${userId.firstName} ${userId.lastName}`;
  };

  const getClientInitials = (userId: Project['userId']) => {
    if (typeof userId === 'string') {
      return 'UC';
    }
    return `${userId.firstName?.[0] || ''}${userId.lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-16"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-t border-gray-200">
              <div className="flex items-center p-4 space-x-4">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-green-100">
          <thead className="bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-green-200">
            <tr>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '80px' }}>
                #
              </th>
              <th className="px-4 py-6 text-left text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '250px' }}>
                Project Name
              </th>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '150px' }}>
                Status
              </th>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '200px' }}>
                Client
              </th>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '180px' }}>
                Phone Number
              </th>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '180px' }}>
                Assistant
              </th>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '150px' }}>
                Created Date
              </th>
              <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap"
                  style={{ minWidth: '140px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-green-100">
            <AnimatePresence>
              {projects.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan={8} className="px-4 py-12 text-center border-b border-green-100">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <div>
                        <p className="text-lg font-semibold text-gray-600">No projects found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Create your first project to get started
                        </p>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                projects.map((project, index) => (
                  <motion.tr 
                    key={project._id} 
                    className="hover:bg-green-50/70 transition-colors duration-150 border-b border-green-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <td className="px-3 py-3 whitespace-nowrap sticky left-0 bg-white hover:bg-green-50/70 z-10 border-r border-green-100">
                      <span className="inline-flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap border-r border-green-100">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {project.projectName?.substring(0, 2)?.toUpperCase() || 'PR'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">
                            {project.projectName || 'Untitled Project'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {project._id.substring(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center border-r border-green-100">
                      {getStatusBadge(project.projectStatus)}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap border-r border-green-100">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 shrink-0">
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {getClientInitials(project.userId)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 text-sm">
                          <div className="font-medium text-gray-900">
                            {getClientName(project.userId)}
                          </div>
                          {typeof project.userId !== 'string' && (
                            <div className="text-xs text-gray-500">
                              {project.userId.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Phone Number */}
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 border-r border-green-100">
                      {project.phoneNumber || (typeof project.phoneNumberId === 'object' && project.phoneNumberId?.phoneNumber) ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-900">
                            {project.phoneNumber || (typeof project.phoneNumberId === 'object' && project.phoneNumberId?.phoneNumber)}
                          </span>
                       
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No phone number</span>
                      )}
                    </td>
                    
                    {/* Assistant */}
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 border-r border-green-100">
                      {project.assistantName || (typeof project.assistantId === 'object' && project.assistantId?.agentName) ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-900">
                            {project.assistantName || (typeof project.assistantId === 'object' && project.assistantId?.agentName)}
                          </span>
                          {typeof project.assistantId === 'object' && project.assistantId?.agentType && (
                            <span className="text-xs text-gray-500 capitalize">
                              {project.assistantId.agentType.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No assistant</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 border-r border-green-100">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(project.createdAt)}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onView(project)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                          title="View project details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onEdit(project)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                          title="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onDelete(project)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination - Table के नीचे */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          loading={isLoading}
          showItemsPerPage={true}
        />
      </div>
    </div>
  );
};

export default ProjectsTable;