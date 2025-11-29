import { loginUser, verifyToken } from '@/api/auth';
import { useRouter } from 'next/navigation';
import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { RootState } from '../store';
import Cookies from 'js-cookie';
import axiosInstance from '@/utils/api';

export const LOGIN_REQUEST = 'LOGIN_REQUEST' as const;
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS' as const;
export const LOGIN_FAILURE = 'LOGIN_FAILURE' as const;
export const LOGOUT = 'LOGOUT' as const;
export const VERIFY_REQUEST = 'VERIFY_REQUEST' as const;
export const VERIFY_SUCCESS = 'VERIFY_SUCCESS' as const;
export const VERIFY_FAILURE = 'VERIFY_FAILURE' as const;

export interface User {
  email: string;
  _id?: string;
  role?: string;
}

export interface LoginRequestAction {
  type: typeof LOGIN_REQUEST;
  [key: string]: any;
}
export interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: { user: User; token: string };
  [key: string]: any;
}
export interface LoginFailureAction {
  type: typeof LOGIN_FAILURE;
  payload: string;
  [key: string]: any;
}
export interface LogoutAction {
  type: typeof LOGOUT;
  [key: string]: any;
}

export interface VerifyRequestAction {
  type: typeof VERIFY_REQUEST;
  [key: string]: any;
}
export interface VerifySuccessAction {
  type: typeof VERIFY_SUCCESS;
  payload: { user: User; token: string };
  [key: string]: any;
}
export interface VerifyFailureAction {
  type: typeof VERIFY_FAILURE;
  payload: string;
  [key: string]: any;
}

export type AuthActionTypes =
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction
  | VerifyRequestAction
  | VerifySuccessAction
  | VerifyFailureAction;

export const loginRequest = (): LoginRequestAction => ({ type: LOGIN_REQUEST });
export const loginSuccess = (user: User, token: string): LoginSuccessAction => ({ type: LOGIN_SUCCESS, payload: { user, token } });
export const loginFailure = (error: string): LoginFailureAction => ({ type: LOGIN_FAILURE, payload: error });
export const logout = (): LogoutAction => ({ type: LOGOUT });

export const verifyRequest = (): VerifyRequestAction => ({ type: VERIFY_REQUEST });
export const verifySuccess = (user: User, token: string): VerifySuccessAction => ({ type: VERIFY_SUCCESS, payload: { user, token } });
export const verifyFailure = (error: string): VerifyFailureAction => ({ type: VERIFY_FAILURE, payload: error });

// Async Thunk for Login
export const performLogin = (email: string, password: string) => async (dispatch: any) => {
  dispatch(loginRequest());
  try {
    const data = await loginUser(email, password);
    // Backend sets httpOnly cookie on successful login; rely on cookie (no localStorage)
    dispatch(loginSuccess(data.user, data.token));
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Login failed';
    dispatch(loginFailure(errorMsg));
    throw new Error(errorMsg);
  }
};

// Async Thunk for Token Verification
export const performVerifyToken = () => async (dispatch: any) => {
  dispatch(verifyRequest());
  try {
    const data = await verifyToken();
    // Backend verify returns token if valid; cookie already sent with request
    dispatch(verifySuccess(data.user, data.token));
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Token verification failed';
    dispatch(verifyFailure(errorMsg));
    return { success: false };
  }
};

// Clear token on logout 
export const performLogout = (router?: ReturnType<typeof useRouter>): ThunkAction<void, RootState, unknown, AnyAction> => async (dispatch) => {
  try {
    await axiosInstance.post('/client-auth/logout'); // Call backend to clear cookie
    Cookies.remove('token'); // Clear token from client-side cookies
    dispatch({ type: LOGOUT });
    // Only redirect if router is provided and we're not already handling it
    if (router) {
      // Don't redirect here - let the page handle it
    }
  } catch (error) {
    // Even if backend call fails, clear client-side data
    Cookies.remove('token');
    dispatch({ type: LOGOUT });
    console.error('Logout error:', error);
  }
};
