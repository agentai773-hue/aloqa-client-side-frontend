"use client";

import { Calendar, Clock, MapPin, Phone, AlertCircle, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAllSiteVisits, type SiteVisit } from "@/hooks/useSiteVisits";
import { useSiteUsers } from "@/hooks/useSiteUsers";
import { EditSiteVisitModal } from "./EditSiteVisitModal";

interface SiteVisitsTableProps {
  onDataLoaded?: (visits: SiteVisit[]) => void;
}

export { type SiteVisit };

export default function SiteVisitsTable({ onDataLoaded }: SiteVisitsTableProps = {}) {
  const { siteVisits, isLoading } = useAllSiteVisits();
  const { data: siteUsersData } = useSiteUsers();
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const siteUsers = siteUsersData?.data || [];

  // Call the callback when data changes
  useEffect(() => {
    if (!isLoading && onDataLoaded) {
      onDataLoaded(siteVisits);
    }
  }, [siteVisits, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#34DB17]"></div>
      </div>
    );
  }

  if (siteVisits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600 text-lg font-medium">No site visits scheduled yet</p>
        <p className="text-gray-500 text-sm mt-1">Site visits will appear here once scheduled</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .table-row {
            animation: slideInUp 0.5s ease-out forwards;
          }
          
          .table-row:nth-child(1) { animation-delay: 0.1s; }
          .table-row:nth-child(2) { animation-delay: 0.15s; }
          .table-row:nth-child(3) { animation-delay: 0.2s; }
          .table-row:nth-child(4) { animation-delay: 0.25s; }
          .table-row:nth-child(5) { animation-delay: 0.3s; }
        `}</style>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#34DB17]/10 to-[#306B25]/10 border-b-2 border-[#34DB17]/30">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Lead Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Site Executive</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Converted</th>
            </tr>
          </thead>
        <tbody>
          {siteVisits.map((visit, idx) => (
            <tr
              key={visit._id || idx}
              className="table-row border-b border-gray-200 hover:bg-gradient-to-r hover:from-[#34DB17]/5 hover:to-[#306B25]/5 transition-all duration-300 group cursor-pointer"
            >
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 group-hover:text-[#306B25] transition-colors duration-300">
                {visit.leadName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {visit.leadPhone}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 font-medium">{visit.projectName}</td>
              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                {visit.siteExecutiveName ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">{visit.siteExecutiveName}</span>
                    {visit.siteExecutivePhone && (
                      <a
                        href={`tel:${visit.siteExecutivePhone}`}
                        className="text-green-600 hover:text-green-700 text-xs hover:underline transition-colors"
                      >
                        {visit.siteExecutivePhone}
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    {(() => {
                      // Find the first active site user for this project
                      const projectSiteUser = siteUsers.find(
                        (user: any) => user.is_active && user.project_name === visit.projectName
                      );

                      if (projectSiteUser) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900">{projectSiteUser.full_name}</span>
                            <a
                              href={`tel:${projectSiteUser.contact_number}`}
                              className="text-green-600 hover:text-green-700 text-xs hover:underline transition-colors"
                            >
                              {projectSiteUser.contact_number}
                            </a>
                          </div>
                        );
                      } else {
                        return (
                          <span className="text-gray-400 italic">No executive available</span>
                        );
                      }
                    })()}
                  </>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#34DB17]" />
                  {new Date(visit.visitDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-[#34DB17]" />
                  {visit.visitTime}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {visit.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* Edit Site Visit Modal */}
      <EditSiteVisitModal
        isOpen={!!editingVisit}
        visit={editingVisit}
        onClose={() => setEditingVisit(null)}
        onSuccess={() => {
          setEditingVisit(null);
        }}
      />
    </>
  );
}
