import  authApi  from './auth-api';

// Start auto-call service
export const startAutoCall = async () => {
  const { data } = await authApi.post('/client-call/start');
  return data;
};

// Stop auto-call service
export const stopAutoCall = async () => {
  const { data } = await authApi.post('/client-call/stop');
  return data;
};

// Get auto-call service status
export const getAutoCallStatus = async () => {
  const { data } = await authApi.get('/client-call/status');
  return data;
};
