import { useQuery } from "@tanstack/react-query";
import { fetchUserPhoneNumbers, PhoneNumber } from "@/api/phoneNumbers";

export function usePhoneNumbers() {
  return useQuery<{ success: boolean; data: PhoneNumber[] }>({
    queryKey: ["phoneNumbers"],
    queryFn: async () => {
      const result = await fetchUserPhoneNumbers();
      return {
        success: result.success,
        data: result.data || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    enabled: true,
  });
}
