'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, FileText, X } from 'lucide-react';
import { useCreateSiteVisit } from '@/hooks/useSiteVisits';
import { useSiteUsers } from '@/hooks/useSiteUsers';
import { SiteUser } from '@/api/site-users';

interface ScheduleSiteVisitFormProps {
  leadId: string;
  leadName: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleSiteVisitForm: React.FC<ScheduleSiteVisitFormProps> = ({
  leadId,
  leadName,
  projectName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateSiteVisit();
  const { data: siteUsersData } = useSiteUsers();
  const siteUsers = siteUsersData?.data || [];

  const [formData, setFormData] = useState({
    visitDate: '',
    visitTime: '',
    siteExecutiveId: '',
    address: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter site users by project name
  const filteredSiteUsers = siteUsers.filter(
    (user: SiteUser) => user.is_active && user.project_name === projectName
  );

  // Auto-assign the first site executive when form loads (if not already set)
  useEffect(() => {
    if (filteredSiteUsers.length > 0 && !formData.siteExecutiveId) {
      setFormData((prev) => ({
        ...prev,
        siteExecutiveId: filteredSiteUsers[0]._id,
      }));
    }
  }, [filteredSiteUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.visitDate || !formData.visitTime) {
        throw new Error('Please fill in all required fields');
      }

      await createMutation.mutateAsync({
        leadId,
        visitDate: formData.visitDate,
        visitTime: formData.visitTime,
        projectName,
        siteExecutiveId: formData.siteExecutiveId || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
      });

      setFormData({
        visitDate: '',
        visitTime: '',
        siteExecutiveId: '',
        address: '',
        notes: '',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule site visit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between border-b border-green-200">
          <div>
            <h2 className="text-xl font-bold">Schedule Site Visit</h2>
            <p className="text-sm text-green-100 mt-1">{leadName}</p>
          </div>
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

          {/* Visit Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Visit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Visit Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              Visit Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={formData.visitTime}
              onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Site Executive */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="h-4 w-4 text-green-600" />
              Site Executive {formData.siteExecutiveId && <span className="text-xs text-green-600">(Auto-assigned)</span>}
            </label>
            {filteredSiteUsers.length > 0 ? (
              <select
                value={formData.siteExecutiveId}
                onChange={(e) => setFormData({ ...formData, siteExecutiveId: e.target.value })}
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
                No active site executives for "{projectName}" project
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter site address (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
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
                  Scheduling...
                </>
              ) : (
                'Schedule Visit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
