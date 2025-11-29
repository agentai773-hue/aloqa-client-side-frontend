import { useSiteVisits as useSiteVisitsAPI, useUpcomingSiteVisits, useCompletedSiteVisits, useCreateSiteVisit, useUpdateSiteVisit } from '@/api/site-visits';
import { useLeads } from './useLeads';
import { useEffect, useState } from 'react';

export interface SiteVisit {
  _id: string;
  visitDate: string;
  visitTime: string;
  projectName: string;
  siteExecutiveId?: string;
  siteExecutiveName?: string;
  siteExecutivePhone?: string;
  address?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  leadName: string;
  leadPhone: string;
}

// Re-export the mutation hooks
export { useCreateSiteVisit, useUpdateSiteVisit };

export const useSiteVisitData = (leadId: string | null) => {
  const { data: allSiteVisitsData, isLoading: isLoadingAll, error: errorAll } = useSiteVisitsAPI(leadId);

  const { data: upcomingData, isLoading: isLoadingUpcoming } = useUpcomingSiteVisits(leadId);

  const { data: completedData, isLoading: isLoadingCompleted } = useCompletedSiteVisits(leadId);

  const allSiteVisits = allSiteVisitsData?.data || [];
  const upcomingSiteVisits = upcomingData?.data || [];
  const completedSiteVisits = completedData?.data || [];

  return {
    allSiteVisits,
    upcomingSiteVisits,
    completedSiteVisits,
    isLoading: isLoadingAll || isLoadingUpcoming || isLoadingCompleted,
    error: errorAll,
  };
};

// New hook to fetch all site visits from all leads with site executive details
export const useAllSiteVisits = () => {
  const { data: leadsData = [] } = useLeads();
  const leads = Array.isArray(leadsData) ? leadsData : [];
  
  const [allSiteVisits, setAllSiteVisits] = useState<SiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllVisits = async () => {
      try {
        setIsLoading(true);
        const visits: SiteVisit[] = [];

        for (const lead of leads) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/client-site-visits/lead/${lead._id}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              }
            );

            if (response.ok) {
              const result = await response.json();
              const visitsList = result.data || [];

              if (Array.isArray(visitsList)) {
                const visitsWithLeadInfo: SiteVisit[] = visitsList.map((visit: any) => {
                  // Handle both cases: siteExecutiveId can be string OR populated object
                  const siteExecutive = typeof visit.siteExecutiveId === 'object' 
                    ? visit.siteExecutiveId 
                    : visit.siteExecutive;

                  return {
                    _id: visit._id,
                    visitDate: visit.visitDate,
                    visitTime: visit.visitTime,
                    projectName: visit.projectName,
                    siteExecutiveId: typeof visit.siteExecutiveId === 'string' 
                      ? visit.siteExecutiveId 
                      : visit.siteExecutiveId?._id,
                    siteExecutiveName: siteExecutive?.full_name || visit.siteExecutiveName,
                    siteExecutivePhone: siteExecutive?.contact_number || visit.siteExecutivePhone,
                    address: visit.address,
                    status: visit.status || 'scheduled',
                    notes: visit.notes,
                    leadName: lead.full_name,
                    leadPhone: lead.contact_number,
                  };
                });

                visits.push(...visitsWithLeadInfo);
              }
            }
          } catch (error) {
            console.error(`Error fetching site visits for lead ${lead._id}:`, error);
          }
        }

        // Sort by date
        visits.sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
        setAllSiteVisits(visits);
      } catch (error) {
        console.error('Error fetching all site visits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (leads.length > 0) {
      fetchAllVisits();
    } else {
      setIsLoading(false);
      setAllSiteVisits([]);
    }
  }, [leads]);

  return {
    siteVisits: allSiteVisits,
    isLoading,
  };
};
