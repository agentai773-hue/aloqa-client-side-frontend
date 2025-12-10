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
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  Search,
  FileX
} from 'lucide-react';
import Pagination from '../ui/Pagination';
import type { Lead } from '../../api/leads';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const LeadsTable = ({ 
  leads, 
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
}: LeadsTableProps) => {

  const getCallStatusBadge = (callStatus: string = 'pending') => {
    const statusConfig = {
      'pending': {
        icon: Clock,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Pending'
      },
      'initiating': {
        icon: PhoneCall,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Initiating'
      },
      'ringing': {
        icon: PhoneIncoming,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Ringing'
      },
      'in_progress': {
        icon: Phone,
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'In Progress'
      },
      'completed': {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed'
      },
      'no_answer': {
        icon: PhoneMissed,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'No Answer'
      },
      'failed': {
        icon: PhoneOff,
        className: 'bg-red-100 text-red-800 border-red-200',
        label: 'Failed'
      },
      'voicemail': {
        icon: Phone,
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: 'Voicemail'
      },
      'busy': {
        icon: AlertCircle,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
        label: 'Busy'
      },
      'cancelled': {
        icon: PhoneOff,
        className: 'bg-slate-100 text-slate-800 border-slate-200',
        label: 'Cancelled'
      }
    };

    const config = statusConfig[callStatus as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getLeadTypeBadge = (leadType: string) => {
    const typeConfig = {
      'hot': {
        className: 'bg-red-100 text-red-800',
        label: 'Hot'
      },
      'warm': {
        className: 'bg-orange-100 text-orange-800',
        label: 'Warm'
      },
      'cold': {
        className: 'bg-blue-100 text-blue-800',
        label: 'Cold'
      }
    };

    const config = typeConfig[leadType as keyof typeof typeConfig] || typeConfig.cold;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <div className="bg-white shadow-xl rounded-xl overflow-hidden h-full flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y-2 divide-green-100 h-full">
          <thead className="bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-green-200">
            <tr>
              <th className="px-4 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '80px' }}>
                #
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '250px' }}>
                Lead Name
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '120px' }}>
                Type
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '150px' }}>
                Call Status
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '180px' }}>
                Phone Number
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-r border-green-100"
                  style={{ minWidth: '150px' }}>
                Created At
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap"
                  style={{ minWidth: '150px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {leads.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileX className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Found</h3>
                      <p className="text-gray-500 max-w-md">
                        There are currently no leads in your database. Create your first lead to get started with lead management.
                      </p>
                    </div>
                 
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {leads.map((lead, index) => (
                  <motion.tr
                    key={lead._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-green-50 transition-all duration-200"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-gray-700 border-r border-green-100">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap border-r border-green-100">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {lead.leadName?.substring(0, 2)?.toUpperCase() || 'LD'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">
                            {lead.leadName || 'Untitled Lead'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {lead._id?.substring(lead._id.length - 8) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center border-r border-green-100">
                      {getLeadTypeBadge(lead.leadType)}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center border-r border-green-100">
                      {getCallStatusBadge(lead.call_status)}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 border-r border-green-100">
                      {lead.phone ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-900">
                            {lead.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No phone number</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 border-r border-green-100">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {lead.createdAt ? formatDate(lead.createdAt) : 'N/A'}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onView(lead)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                          title="View lead details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(lead)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          title="Edit lead"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(lead)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Table के नीचे */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 shrink-0">
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

export default LeadsTable;