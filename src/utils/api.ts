import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ensures cookies are sent with requests
});

// NOTE: Authentication is handled via httpOnly cookie named 'token'.
// The backend sets this cookie on login. Do NOT use localStorage for tokens.

export default axiosInstance;
