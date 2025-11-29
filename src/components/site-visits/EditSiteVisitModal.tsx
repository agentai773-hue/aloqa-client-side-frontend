'use client';

import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { useUpdateSiteVisit } from '@/hooks/useSiteVisits';
import { useSiteUsers } from '@/hooks/useSiteUsers';
import { SiteUser } from '@/api/site-users';
import { SiteVisit } from '@/hooks/useSiteVisits';

interface EditSiteVisitModalProps {
  isOpen: boolean;
  visit: SiteVisit | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditSiteVisitModal: React.FC<EditSiteVisitModalProps> = ({
  isOpen,
  visit,
  onClose,
  onSuccess,
}) => {
  const updateMutation = useUpdateSiteVisit();
  const { data: siteUsersData } = useSiteUsers();
  const siteUsers = siteUsersData?.data || [];

  const [selectedExecutiveId, setSelectedExecutiveId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter site users by project name
  const filteredSiteUsers = siteUsers.filter(
    (user: SiteUser) =>
      user.is_active && visit && user.project_name === visit.projectName
  );

  useEffect(() => {
    if (visit?.siteExecutiveId) {
      setSelectedExecutiveId(visit.siteExecutiveId);
    } else {
      setSelectedExecutiveId('');
    }
  }, [visit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!visit) throw new Error('No visit selected');

      await updateMutation.mutateAsync({
        id: visit._id,
        data: {
          siteExecutiveId: selectedExecutiveId || undefined,
        },
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update site visit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !visit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between border-b border-green-200">
          <h2 className="text-xl font-bold">Assign Site Executive</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <span className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-green-600" />
                Site Executive for "{visit.projectName}"
              </span>
            </label>
            {filteredSiteUsers.length > 0 ? (
              <select
                value={selectedExecutiveId}
                onChange={(e) => setSelectedExecutiveId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Select Site Executive (Optional)</option>
                {filteredSiteUsers.map((user: SiteUser) => (
                  <option key={user._id} value={user._id}>
                    {user.full_name} ({user.contact_number})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                No active site executives for "{visit.projectName}" project
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                'Assign Executive'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
