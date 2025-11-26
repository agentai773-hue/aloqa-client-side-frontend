"use client";

import { AppDispatch } from '../store';
import {
  getAllLeads,
  getLeadById,
  checkLeadExists,
  createLead as createLeadAPI,
  updateLead as updateLeadAPI,
  deleteLead as deleteLeadAPI,
  importLeadsCSV,
} from '@/api/leads';
import {
  fetchLeadsStart,
  fetchLeadsSuccess,
  fetchLeadsFailure,
  createLeadStart,
  createLeadSuccess,
  createLeadFailure,
  updateLeadStart,
  updateLeadSuccess,
  updateLeadFailure,
  deleteLeadStart,
  deleteLeadSuccess,
  deleteLeadFailure,
  importLeadsStart,
  importLeadsSuccess,
  importLeadsFailure,
  Lead,
} from './leadsReducer';

// Fetch all leads
export const fetchLeads = () => async (dispatch: AppDispatch) => {
  dispatch(fetchLeadsStart());
  try {
    const response = await getAllLeads();
    if (response.success) {
      // Normalize backend `_id` to `id` for frontend usage
      const mapped = (response.data || []).map((l: any) => ({ ...l, id: l.id || l._id }));
      dispatch(fetchLeadsSuccess(mapped));
    } else {
      dispatch(fetchLeadsFailure(response.error || 'Failed to fetch leads'));
    }
  } catch (error: any) {
    // Handle axios / network errors more gracefully
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message || error?.response?.data?.error;

    if (status === 401) {
      // If unauthorized, return empty list silently (avoid raw axios message)
      dispatch(fetchLeadsSuccess([]));
      return;
    }

    dispatch(fetchLeadsFailure(serverMessage || error.message || 'An error occurred'));
  }
};

// Fetch single lead by ID
export const fetchLeadById = (id: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(fetchLeadsStart());
    try {
      const response = await getLeadById(id);
      if (response.success) {
        const lead = { ...response.data, id: response.data.id || response.data._id };
        return { success: true, data: lead };
      } else {
        dispatch(fetchLeadsFailure(response.error || 'Failed to fetch lead'));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      
      if (status === 401) {
        dispatch(fetchLeadsFailure('Unauthorized. Please login.'));
        return { success: false, error: 'Unauthorized' };
      }

      dispatch(fetchLeadsFailure(serverMessage || error.message || 'An error occurred'));
      return { success: false, error: serverMessage || error.message };
    }
  };

// Create new lead
export const createLead = (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) =>
  async (dispatch: AppDispatch) => {
    dispatch(createLeadStart());
    try {
      const response = await createLeadAPI(leadData);
      if (response.success) {
        const lead = { ...response.data, id: response.data.id || response.data._id };
        dispatch(createLeadSuccess(lead));
        return { success: true };
      } else {
        dispatch(createLeadFailure(response.error || 'Failed to create lead'));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
        const status = error?.response?.status;
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
        if (status === 401) {
          dispatch(createLeadFailure('Unauthorized. Please login.'));
          return { success: false, error: 'Unauthorized' };
        }
        dispatch(createLeadFailure(serverMessage || error.message || 'An error occurred'));
        return { success: false, error: serverMessage || error.message };
    }
  };

// Update lead
export const updateLead = (id: string, leadData: Partial<Lead>) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateLeadStart());
    try {
      const response = await updateLeadAPI(id, leadData);
      if (response.success) {
        const lead = { ...response.data, id: response.data.id || response.data._id };
        dispatch(updateLeadSuccess(lead));
        return { success: true };
      } else {
        dispatch(updateLeadFailure(response.error || 'Failed to update lead'));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
        const status = error?.response?.status;
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
        if (status === 401) {
          dispatch(updateLeadFailure('Unauthorized. Please login.'));
          return { success: false, error: 'Unauthorized' };
        }
        dispatch(updateLeadFailure(serverMessage || error.message || 'An error occurred'));
        return { success: false, error: serverMessage || error.message };
    }
  };

// Delete lead
export const deleteLead = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(deleteLeadStart());
  try {
    const response = await deleteLeadAPI(id);
    if (response.success) {
      dispatch(deleteLeadSuccess(id));
      return { success: true };
    } else {
      dispatch(deleteLeadFailure(response.error || 'Failed to delete lead'));
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
    if (status === 401) {
      dispatch(deleteLeadFailure('Unauthorized. Please login.'));
      return { success: false, error: 'Unauthorized' };
    }
    dispatch(deleteLeadFailure(serverMessage || error.message || 'An error occurred'));
    return { success: false, error: serverMessage || error.message };
  }
};

// Import leads from CSV
export const importLeads = (leadsData: Array<Record<string, any>>) =>
  async (dispatch: AppDispatch) => {
    dispatch(importLeadsStart());
    try {
      const response = await importLeadsCSV(leadsData);
      if (response.success) {
        // Map created leads to include `id`
        const created = (response.data || []).map((l: any) => ({ ...l, id: l.id || l._id }));
        dispatch(importLeadsSuccess(created));
        return { success: true, count: created.length, meta: response.meta || null };
      } else {
        dispatch(importLeadsFailure(response.error || 'Failed to import leads'));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
        const status = error?.response?.status;
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
        if (status === 401) {
          dispatch(importLeadsFailure('Unauthorized. Please login.'));
          return { success: false, error: 'Unauthorized' };
        }
        dispatch(importLeadsFailure(serverMessage || error.message || 'An error occurred'));
        return { success: false, error: serverMessage || error.message };
    }
  };

