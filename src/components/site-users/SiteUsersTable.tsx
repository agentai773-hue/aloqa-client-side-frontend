'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useSiteUsers, useDeleteSiteUser, useDeactivateSiteUser, useActivateSiteUser } from '@/hooks/useSiteUsers';
import { EditSiteUserModal } from './EditSiteUserModal';
import { ConfirmationModal } from './ConfirmationModal';
import { SiteUser } from '@/api/site-users';

type ActionType = 'activate' | 'deactivate' | 'delete' | null;

export const SiteUsersTable: React.FC = () => {
  const { data: siteUsersData, isLoading, error, refetch } = useSiteUsers();
  const deleteActionMutation = useDeleteSiteUser();
  const deactivateMutation = useDeactivateSiteUser();
  const activateMutation = useActivateSiteUser();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<SiteUser | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ActionType>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const siteUsers = siteUsersData?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdownEl = dropdownRefs.current[openDropdownId];
        if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
          const button = (event.target as HTMLElement).closest('button[title="More Actions"]');
          if (!button) {
            setOpenDropdownId(null);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  const handleEditClick = (user: SiteUser) => {
    setEditingUserId(user._id);
    setEditingUser(user);
  };

  const toggleDropdown = (userId: string) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  const handleDeleteUser = async (id: string) => {
    setConfirmUserId(id);
    setConfirmAction('delete');
  };

  const handleDeactivate = async (id: string) => {
    setConfirmUserId(id);
    setConfirmAction('deactivate');
  };

  const handleActivate = async (id: string) => {
    setConfirmUserId(id);
    setConfirmAction('activate');
  };

  const executeAction = async () => {
    if (!confirmUserId || !confirmAction) return;

    setIsProcessing(true);
    setDeleteError('');
    setDeleteSuccess('');

    try {
      if (confirmAction === 'delete') {
        await deleteActionMutation.mutateAsync(confirmUserId);
        setDeleteSuccess('Site user deleted successfully!');
      } else if (confirmAction === 'deactivate') {
        await deactivateMutation.mutateAsync(confirmUserId);
        setDeleteSuccess('Site user deactivated successfully!');
      } else if (confirmAction === 'activate') {
        await activateMutation.mutateAsync(confirmUserId);
        setDeleteSuccess('Site user activated successfully!');
      }

      setTimeout(() => {
        setDeleteSuccess('');
        refetch();
      }, 3000);
    } catch (err: any) {
      setDeleteError(err.message || `Failed to ${confirmAction} site user`);
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
      setConfirmUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Error loading site users</p>
      </div>
    );
  }

  return (
    <>
      {/* Alert Messages */}
      {deleteError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {deleteError}
        </div>
      )}

      {deleteSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {deleteSuccess}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {siteUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-semibold text-gray-700 mb-2">No site users found</p>
            <p className="text-sm">Create your first site user to get started</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-emerald-600 border-b border-green-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Contact Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {siteUsers.map((user: SiteUser) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-all duration-300">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-green-600 hover:text-green-700 hover:underline transition-colors"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <a
                        href={`tel:${user.contact_number}`}
                        className="text-green-600 hover:text-green-700 hover:underline transition-colors"
                      >
                        {user.contact_number}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.project_name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          title="Edit Site User"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(user._id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="More Actions"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <div
                            ref={(el) => {
                              if (el) dropdownRefs.current[user._id] = el;
                            }}
                            className={`absolute right-0 bottom-full mb-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg transition-all z-50 ${
                              openDropdownId === user._id
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible'
                            }`}
                          >
                            {user.is_active ? (
                              <>
                                <button
                                  onClick={() => {
                                    handleDeactivate(user._id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 border-b border-gray-200 transition-colors"
                                >
                                  Deactivate
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user._id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    handleActivate(user._id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 border-b border-gray-200 transition-colors"
                                >
                                  Activate
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user._id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditSiteUserModal
        userId={editingUserId || ''}
        isOpen={!!editingUserId}
        user={editingUser}
        onClose={() => {
          setEditingUserId(null);
          setEditingUser(null);
        }}
        onSuccess={() => {
          refetch();
          setEditingUserId(null);
          setEditingUser(null);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction !== null}
        title={
          confirmAction === 'activate'
            ? 'Activate Site User'
            : confirmAction === 'deactivate'
            ? 'Deactivate Site User'
            : 'Delete Site User'
        }
        message={
          confirmAction === 'activate'
            ? 'Are you sure you want to activate this site user?'
            : confirmAction === 'deactivate'
            ? 'Are you sure you want to deactivate this site user?'
            : 'Are you sure you want to delete this site user? This action cannot be undone.'
        }
        confirmText={
          confirmAction === 'activate'
            ? 'Activate'
            : confirmAction === 'deactivate'
            ? 'Deactivate'
            : 'Delete'
        }
        isDangerous={confirmAction === 'delete'}
        isLoading={isProcessing}
        onConfirm={executeAction}
        onCancel={() => {
          setConfirmAction(null);
          setConfirmUserId(null);
        }}
      />
    </>
  );
};
