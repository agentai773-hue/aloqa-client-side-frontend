import { apiMethods } from '../../config/api';
import type { ApiResponse } from '../../config/api';

// Phone Number interface
export interface PhoneNumber {
  _id: string;
  phoneNumber: string;
  country: string;
  status: 'available' | 'assigned' | 'deleted';
  assignedAt?: string;
}

// Phone Numbers API
export const phoneNumbersAPI = {
  // Get current user's assigned phone numbers
  getUserPhoneNumbers: async (): Promise<ApiResponse<PhoneNumber[]>> => {
    return apiMethods.get<PhoneNumber[]>('/phone-numbers');
  },
};

// Export types
export type { PhoneNumber };