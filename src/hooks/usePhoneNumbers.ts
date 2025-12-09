import { useQuery } from '@tanstack/react-query';
import { phoneNumbersAPI } from '../api/phoneNumbers';
import type { PhoneNumber } from '../api/phoneNumbers';

export const usePhoneNumbers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['userPhoneNumbers'],
    queryFn: phoneNumbersAPI.getUserPhoneNumbers,
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: enabled, // Only fetch when enabled
  });
};

// Helper hook to get phone numbers as options for dropdowns
export const usePhoneNumberOptions = (enabled: boolean = true) => {
  const { data: phoneNumbers, ...rest } = usePhoneNumbers(enabled);
  
  const options = phoneNumbers?.map((phone: PhoneNumber) => ({
    value: phone._id,
    label: `${phone.phoneNumber} (${phone.country})`,
    phone: phone.phoneNumber,
    country: phone.country,
  })) || [];

  return {
    options,
    phoneNumbers,
    ...rest,
  };
};