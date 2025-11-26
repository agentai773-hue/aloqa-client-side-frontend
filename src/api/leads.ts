import axiosInstance from '@/utils/api';

export async function getAllLeads() {
  const response = await axiosInstance.get('/leads/all');
  return response.data;
}

export async function getLeadById(id: string) {
  const response = await axiosInstance.get(`/leads/${id}`);
  return response.data;
}

export async function checkLeadExists(contactNumber: string) {
  try {
    const response = await axiosInstance.get('/leads/check', {
      params: { contact_number: contactNumber }
    });
    return response.data;
  } catch (error: any) {
    // If lead doesn't exist, it might return 404, so we catch it
    if (error?.response?.status === 404) {
      return { success: true, exists: false };
    }
    throw error;
  }
}

export async function createLead(leadData: any) {
  const response = await axiosInstance.post('/leads/create', leadData);
  return response.data;
}

export async function updateLead(id: string, leadData: any) {
  const response = await axiosInstance.put(`/leads/${id}`, leadData);
  return response.data;
}

export async function deleteLead(id: string) {
  const response = await axiosInstance.delete(`/leads/${id}`);
  return response.data;
}

export async function importLeadsCSV(leadsData: Array<Record<string, any>>) {
  const response = await axiosInstance.post('/leads/import/csv', { leadsData });
  return response.data;
}

