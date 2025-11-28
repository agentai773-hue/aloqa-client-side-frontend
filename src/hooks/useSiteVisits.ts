import { useSiteVisits, useUpcomingSiteVisits, useCompletedSiteVisits } from '@/api/site-visits';

export const useSiteVisitData = (leadId: string | null) => {
  const { data: allSiteVisitsData, isLoading: isLoadingAll, error: errorAll } = useSiteVisits(leadId);

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
