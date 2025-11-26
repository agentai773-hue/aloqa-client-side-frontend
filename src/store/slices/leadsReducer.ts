"use client";

export interface Lead {
  id: string;
  full_name: string;
  contact_number: string;
  call_status: 'pending' | 'connected' | 'not_connected' | 'callback';
  lead_type: 'pending' | 'hot' | 'cold' | 'fake' | 'connected';
  project_name?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface LeadsState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: LeadsState = {
  leads: [],
  loading: false,
  error: null,
  success: false,
};

// Action types
const FETCH_LEADS_START = 'FETCH_LEADS_START';
const FETCH_LEADS_SUCCESS = 'FETCH_LEADS_SUCCESS';
const FETCH_LEADS_FAILURE = 'FETCH_LEADS_FAILURE';

const CREATE_LEAD_START = 'CREATE_LEAD_START';
const CREATE_LEAD_SUCCESS = 'CREATE_LEAD_SUCCESS';
const CREATE_LEAD_FAILURE = 'CREATE_LEAD_FAILURE';

const UPDATE_LEAD_START = 'UPDATE_LEAD_START';
const UPDATE_LEAD_SUCCESS = 'UPDATE_LEAD_SUCCESS';
const UPDATE_LEAD_FAILURE = 'UPDATE_LEAD_FAILURE';

const DELETE_LEAD_START = 'DELETE_LEAD_START';
const DELETE_LEAD_SUCCESS = 'DELETE_LEAD_SUCCESS';
const DELETE_LEAD_FAILURE = 'DELETE_LEAD_FAILURE';

const IMPORT_LEADS_START = 'IMPORT_LEADS_START';
const IMPORT_LEADS_SUCCESS = 'IMPORT_LEADS_SUCCESS';
const IMPORT_LEADS_FAILURE = 'IMPORT_LEADS_FAILURE';

const RESET_STATE = 'RESET_STATE';

// Reducer
const leadsReducer = (
  state = initialState,
  action: any
): LeadsState => {
  switch (action.type) {
    case FETCH_LEADS_START:
    case CREATE_LEAD_START:
    case UPDATE_LEAD_START:
    case DELETE_LEAD_START:
    case IMPORT_LEADS_START:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case FETCH_LEADS_SUCCESS:
      return {
        ...state,
        loading: false,
        leads: action.payload,
        success: true,
        error: null,
      };

    case CREATE_LEAD_SUCCESS:
      return {
        ...state,
        loading: false,
        leads: [...state.leads, action.payload],
        success: true,
        error: null,
      };

    case UPDATE_LEAD_SUCCESS:
      return {
        ...state,
        loading: false,
        leads: state.leads.map((lead) =>
          lead.id === action.payload.id ? action.payload : lead
        ),
        success: true,
        error: null,
      };

    case DELETE_LEAD_SUCCESS:
      return {
        ...state,
        loading: false,
        leads: state.leads.filter((lead) => lead.id !== action.payload),
        success: true,
        error: null,
      };

    case IMPORT_LEADS_SUCCESS:
      return {
        ...state,
        loading: false,
        leads: [...state.leads, ...action.payload],
        success: true,
        error: null,
      };

    case FETCH_LEADS_FAILURE:
    case CREATE_LEAD_FAILURE:
    case UPDATE_LEAD_FAILURE:
    case DELETE_LEAD_FAILURE:
    case IMPORT_LEADS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Action creators
export const fetchLeadsStart = () => ({
  type: FETCH_LEADS_START,
});

export const fetchLeadsSuccess = (leads: Lead[]) => ({
  type: FETCH_LEADS_SUCCESS,
  payload: leads,
});

export const fetchLeadsFailure = (error: string) => ({
  type: FETCH_LEADS_FAILURE,
  payload: error,
});

export const createLeadStart = () => ({
  type: CREATE_LEAD_START,
});

export const createLeadSuccess = (lead: Lead) => ({
  type: CREATE_LEAD_SUCCESS,
  payload: lead,
});

export const createLeadFailure = (error: string) => ({
  type: CREATE_LEAD_FAILURE,
  payload: error,
});

export const updateLeadStart = () => ({
  type: UPDATE_LEAD_START,
});

export const updateLeadSuccess = (lead: Lead) => ({
  type: UPDATE_LEAD_SUCCESS,
  payload: lead,
});

export const updateLeadFailure = (error: string) => ({
  type: UPDATE_LEAD_FAILURE,
  payload: error,
});

export const deleteLeadStart = () => ({
  type: DELETE_LEAD_START,
});

export const deleteLeadSuccess = (leadId: string) => ({
  type: DELETE_LEAD_SUCCESS,
  payload: leadId,
});

export const deleteLeadFailure = (error: string) => ({
  type: DELETE_LEAD_FAILURE,
  payload: error,
});

export const importLeadsStart = () => ({
  type: IMPORT_LEADS_START,
});

export const importLeadsSuccess = (leads: Lead[]) => ({
  type: IMPORT_LEADS_SUCCESS,
  payload: leads,
});

export const importLeadsFailure = (error: string) => ({
  type: IMPORT_LEADS_FAILURE,
  payload: error,
});

export const resetLeadsState = () => ({
  type: RESET_STATE,
});

export default leadsReducer;
