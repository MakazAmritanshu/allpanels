import axios from 'axios';

const isLocal = import.meta.env.VITE_IS_LOCAL === 'true';

const api = axios.create({
  baseURL: isLocal ? import.meta.env.VITE_LOCAL_API_URL : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const host = isLocal ? import.meta.env.VITE_LOCAL_WS_URL : '/';
