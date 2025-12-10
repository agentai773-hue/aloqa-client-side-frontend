'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import ProjectsTable from '../../../components/projects/ProjectsTable';
import ProjectFormModal from '../../../components/projects/ProjectFormModal';
import DeleteConfirmModal from '../../../components/projects/DeleteConfirmModal';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjectQueries';
import { useDebounce } from '../../../hooks/useDebounce';
import type { Project, CreateProjectData, UpdateProjectData } from '../../../types/project';
import toast from 'react-hot-toast';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7); // Same as leads page

  // Modal state  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Prepare API parameters for server-side filtering and pagination
  const apiParams = {
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  };

  // Use useProjects hook with pagination parameters
  const { data: projectsResponse, isLoading: loading, error } = useProjects(apiParams);


  // Extract data from API response - same pattern as leads
  const projects = projectsResponse?.projects || [];
  const pagination = {
    total: projectsResponse?.total || 0,
    page: projectsResponse?.page || 1,
    limit: projectsResponse?.limit || 7,
    totalPages: projectsResponse?.totalPages || 0
  };

  // Create/Update/Delete mutations
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value !== searchTerm) {
      setPage(1);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: CreateProjectData | UpdateProjectData) => {
    try {
      if (selectedProject) {
        await updateProjectMutation.mutateAsync({ _id: selectedProject._id, ...data });
        toast.success('Project updated successfully!');
      } else {
        await createProjectMutation.mutateAsync(data as CreateProjectData);
        toast.success('Project created successfully!');
      }
      setFormOpen(false);
      setSelectedProject(null);
    } catch (error: unknown) {
      console.error('Form submit error:', error);
      
      // Better error handling with detailed error info
      const errorData = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      
      const errorMessage = errorData?.response?.data?.message || 
                          errorData?.message || 
                          (selectedProject ? 'Failed to update project' : 'Failed to create project');
      
      toast.error(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProjectMutation.mutateAsync(projectToDelete._id);
      toast.success('Project deleted successfully!');
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project List</h1>
          <p className="text-gray-600">Manage and track your projects</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedProject(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Project
          </button>
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
                placeholder="Search projects by name..."
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
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-1" />
              More
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">
                {error?.message || 'An error occurred while fetching projects'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Table - Using Component */}
      <ProjectsTable
        projects={projects}
        isLoading={loading}
        onEdit={(project) => {
          setSelectedProject(project);
          setFormOpen(true);
        }}
        onDelete={(project) => {
          setProjectToDelete(project);
          setDeleteConfirmOpen(true);
        }}
        onView={(project) => {
          toast.success(`Viewing project: ${project.projectName}`);
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

      {/* Summary */}
      {projects.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-sm text-gray-500">Total Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {projects.filter((p: Project) => p.projectStatus === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {projects.filter((p: Project) => p.projectStatus === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {projects.filter((p: Project) => p.projectStatus === 'planning').length}
              </div>
              <div className="text-sm text-gray-500">Planning</div>
            </div>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={formOpen}
        mode={selectedProject ? 'edit' : 'create'}
        onClose={() => {
          setFormOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleFormSubmit}
        project={selectedProject}
        isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        project={projectToDelete}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
};

export default Projects;