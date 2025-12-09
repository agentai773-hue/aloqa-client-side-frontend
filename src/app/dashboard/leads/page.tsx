'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useLeads, useDeleteLead, Lead } from '../../../hooks/useLeads';
import { useDebounce } from '../../../hooks/useDebounce';
import toast from 'react-hot-toast';
import Pagination from '../../../components/ui/Pagination';
import { AloqaInlineLoader } from '../../../components/loaders/AloqaLoader';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLeadType, setFilterLeadType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7); // Increased default limit

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Prepare API parameters for server-side filtering and pagination
  const apiParams = {
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    leadType: filterLeadType !== 'all' ? filterLeadType : undefined,
  };

  // Use useLeads hook with pagination parameters
  const { data: leadsResponse, isLoading: loading } = useLeads(apiParams);
  const deleteLeadMutation = useDeleteLead();

  // Extract data from API response
  const leads = leadsResponse?.leads || [];
  const pagination = {
    total: leadsResponse?.total || 0,
    page: leadsResponse?.page || 1,
    limit: leadsResponse?.limit || 25,
    totalPages: leadsResponse?.totalPages || 0
  };

  console.log('📊 Leads pagination info:', pagination);
  console.log('📋 Current leads:', leads.length, 'items');

  // No need for client-side filtering anymore as it's done server-side
  const displayLeads = leads;

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset page immediately when user types, not when debounced value changes
    if (value !== searchTerm) {
      setPage(1);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(1); // Reset page when filter changes
  };

  const handleLeadTypeFilterChange = (value: string) => {
    setFilterLeadType(value);
    setPage(1); // Reset page when filter changes
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLeadMutation.mutateAsync(leadId);
      toast.success('Lead deleted successfully');
      // The useLeads hook will automatically refetch data
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-green-100 text-green-800 border-green-300',
      old: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return (
      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border-2 ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getLeadTypeBadge = (leadType: string) => {
    const leadTypeColors = {
      hot: 'bg-red-100 text-red-800 border-red-300',
      cold: 'bg-blue-100 text-blue-800 border-blue-300',
      fake: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return (
      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border-2 ${leadTypeColors[leadType as keyof typeof leadTypeColors] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {leadType.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AloqaInlineLoader text="Loading your leads..." size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead List</h1>
          <p className="text-gray-600">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/leads/add"
            className="inline-flex items-center px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search leads by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DD149] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="old">Old</option>
            </select>

            <select
              value={filterLeadType}
              onChange={(e) => handleLeadTypeFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DD149] focus:border-transparent"
            >
              <option value="all">All Lead Types</option>
              <option value="hot">Hot</option>
              <option value="cold">Cold</option>
              <option value="fake">Fake</option>
            </select>

            <button className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-1" />
              More
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-green-100">
            <thead className="bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-green-200">
              <tr>
                <th className="px-4 py-6 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-r border-green-100">
                  Lead Name
                </th>
                <th className="px-4 py-6 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-r border-green-100">
                  Contact
                </th>
                <th className="px-4 py-6 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-r border-green-100">
                  Project
                </th>
                <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider border-r border-green-100">
                  Lead Type
                </th>
                <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider border-r border-green-100">
                  Status
                </th>
                <th className="px-4 py-6 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-green-100">
              {displayLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center border-b border-green-100">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-600">No leads found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Start by adding your first lead
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                displayLeads.map((lead: Lead, index: number) => (
                  <motion.tr 
                    key={lead._id}
                    className="hover:bg-green-50/70 transition-colors duration-150 border-b border-green-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap border-r border-green-100">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {lead.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-green-100">
                      <div>
                        <div className="text-sm text-gray-900">
                          {lead.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-green-100">
                      <div className="text-sm text-gray-900 max-w-[200px] truncate">
                        {lead.interestedProject}
                      </div>
                      <div className="text-xs text-gray-500">
                        Project: {lead.interestedProject}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center border-r border-green-100">
                      {getLeadTypeBadge(lead.leadType || 'cold')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center border-r border-green-100">
                      {getStatusBadge(lead.status || 'new')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                          title="View lead"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          title="Edit lead"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead._id!)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Admin Panel Style Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1); // Reset to first page when changing items per page
          }}
          loading={loading}
          showItemsPerPage={true}
        />
      </div>

      {/* Summary */}
      {displayLeads.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-sm text-gray-500">Total Leads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {displayLeads.filter((l: Lead) => l.leadType === 'hot').length}
              </div>
              <div className="text-sm text-gray-500">Hot Leads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {displayLeads.filter((l: Lead) => l.leadType === 'cold').length}
              </div>
              <div className="text-sm text-gray-500">Cold Leads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {displayLeads.filter((l: Lead) => l.status === 'new').length}
              </div>
              <div className="text-sm text-gray-500">New Leads</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}