'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { useLeads, useDeleteLead, Lead } from '../../../hooks/useLeads';
import { useDebounce } from '../../../hooks/useDebounce';
import toast from 'react-hot-toast';
import LeadsTable from '../../../components/leads/LeadsTable';
import { AloqaInlineLoader } from '../../../components/loaders/AloqaLoader';
import DeleteLeadModal from '../../../components/leads/DeleteLeadModal';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeadType, setFilterLeadType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7); // Increased default limit
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Prepare API parameters for server-side filtering and pagination
  const apiParams = {
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    leadType: filterLeadType !== 'all' ? filterLeadType : undefined,
  };

  // Use useLeads hook with pagination parameters
  const { data: leadsResponse, isLoading: loading } = useLeads(apiParams);
  const deleteLeadMutation = useDeleteLead();

  // Extract data from API response - note that leadsResponse is the data object from the API response
  const leads = leadsResponse?.leads || [];
  const pagination = {
    total: leadsResponse?.total || 0,
    page: leadsResponse?.page || 1,
    limit: leadsResponse?.limit || 25,
    totalPages: leadsResponse?.totalPages || 0
  };

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

  const handleLeadTypeFilterChange = (value: string) => {
    setFilterLeadType(value);
    setPage(1); // Reset page when filter changes
  };

  const handleDeleteLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setDeleteModalOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!selectedLead) return;
    
    try {
      await deleteLeadMutation.mutateAsync(selectedLead._id!);
      toast.success('Lead deleted successfully');
      setDeleteModalOpen(false);
      setSelectedLead(null);
      // The useLeads hook will automatically refetch data
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedLead(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AloqaInlineLoader text="Loading your leads..." size="md" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-150px)] flex flex-col space-y-3 p-4">
      {/* Filters Section - Fixed Height */}
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 shrink-0">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
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

          {/* Filters and Add Lead */}
          <div className="flex gap-3">
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

            {/* Add Lead Button */}
            <Link
              href="/dashboard/leads/add"
              className="inline-flex items-center px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Lead
            </Link>
          </div>
        </div>
      </div>

      {/* Leads Table - Full Height Container */}
      <div className="flex-1 min-h-0">
        <LeadsTable
          leads={displayLeads}
          isLoading={loading}
          onEdit={(lead) => {
            // Edit logic here
            toast.success(`Editing lead: ${lead.leadName || 'Untitled'}`);
          }}
          onDelete={handleDeleteLead}
        onView={(lead) => {
          // View logic here  
          toast.success(`Viewing lead: ${lead.leadName || 'Untitled'}`);
        }}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={(newLimit: number) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Summary - Fixed Height */}
      {displayLeads.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-xs text-gray-500">Total Leads</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">
                {displayLeads.filter((l: Lead) => l.leadType === 'hot').length}
              </div>
              <div className="text-xs text-gray-500">Hot Leads</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">
                {displayLeads.filter((l: Lead) => l.leadType === 'cold').length}
              </div>
              <div className="text-xs text-gray-500">Cold Leads</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-600">
                {displayLeads.filter((l: Lead) => l.leadType === 'fake').length}
              </div>
              <div className="text-xs text-gray-500">Fake Leads</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      <DeleteLeadModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteLead}
        lead={selectedLead}
        isLoading={deleteLeadMutation.isPending}
      />
    </div>
  );
}