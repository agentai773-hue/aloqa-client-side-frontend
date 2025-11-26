import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function loginUser(email: string, password: string) {
  const response = await axiosInstance.post('/client-auth/login', { email, password });
  return response.data;
}

export async function verifyToken() {
  const response = await axiosInstance.post('/client-auth/verify', {});
  return response.data;
}
