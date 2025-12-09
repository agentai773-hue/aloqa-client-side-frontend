
import { leadsAPI, type Lead } from './leads/index';

// Export the create function that components expect
export const createLead = leadsAPI.create;

// Export other commonly used functions
export const updateLead = leadsAPI.update;
export const deleteLead = leadsAPI.delete;
export const getAllLeads = leadsAPI.getAll;
export const getLeadById = leadsAPI.getById;
export const createBulkLeads = leadsAPI.createBulk;

// Export the Lead type
export type { Lead };

// Export the full API object for advanced use
export { leadsAPI };