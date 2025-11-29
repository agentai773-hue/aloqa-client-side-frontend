import axiosInstance from "@/utils/api";

export interface PhoneNumber {
  _id: string;
  phoneNumber: string;
  friendlyName?: string;
  country?: string;
  isDefault?: boolean;
}

export interface PhoneNumbersResponse {
  success: boolean;
  data: PhoneNumber[];
  message?: string;
}

/**
 * Fetch all phone numbers for the authenticated user
 * Uses token from httpOnly cookie
 */
export async function fetchUserPhoneNumbers(): Promise<PhoneNumbersResponse> {
  try {
    const response = await axiosInstance.get<PhoneNumbersResponse>(
      "/client-phone-numbers"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    throw error;
  }
}

/**
 * Get single phone number by ID
 */
export async function getPhoneNumberById(
  phoneNumberId: string
): Promise<{ success: boolean; data: PhoneNumber }> {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      data: PhoneNumber;
    }>(`/client-phone-numbers/${phoneNumberId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching phone number:", error);
    throw error;
  }
}
