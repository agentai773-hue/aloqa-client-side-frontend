import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  VERIFY_REQUEST,
  VERIFY_SUCCESS,
  VERIFY_FAILURE,
  AuthActionTypes,
  User
} from './authActions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export default function authReducer(
  state = initialState,
  action: AuthActionTypes
): AuthState {
  switch (action.type) {
    case LOGIN_REQUEST:
    case VERIFY_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
    case VERIFY_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case LOGIN_FAILURE:
    case VERIFY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
}
