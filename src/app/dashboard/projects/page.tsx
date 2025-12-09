'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import ProjectsTable from '../../../components/projects/ProjectsTable';
import ProjectFormModal from '../../../components/projects/ProjectFormModal';
import DeleteConfirmModal from '../../../components/projects/DeleteConfirmModal';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjectQueries';
import type { Project, CreateProjectData, UpdateProjectData } from '../../../types/project';
import toast from 'react-hot-toast';

const Projects = () => {
  const { data: projects = [], isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'>('all');

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project: Project) => project.projectName?.toLowerCase()?.includes(query) || false);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project: Project) => project.projectStatus === statusFilter);
    }
    return filtered;
  }, [projects, searchQuery, statusFilter]);

  const handleCreateProject = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  const handleViewProject = (project: Project) => {
    console.log('View project:', project);
    toast.success(`Viewing project: ${project.projectName || 'Untitled Project'}`);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

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
    <div className="space-y-6 p-6">
    

      <div className="bg-white rounded-lg shadow-sm border-grey-600 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none bg-white outline-none"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
              {filteredProjects.length} projects
            </div>
         
            <motion.button
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <div className="shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading projects</h3>
                <p className="mt-1 text-sm text-red-700">{error.message || 'Failed to load projects. Please try again.'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ProjectsTable
          projects={filteredProjects}
          isLoading={isLoading}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onView={handleViewProject}
        />
      </motion.div>

      <ProjectFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleFormSubmit}
        project={selectedProject}
        mode={selectedProject ? 'edit' : 'create'}
        isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
      />

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
