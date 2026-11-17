import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('cartalogo_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch {
        localStorage.removeItem('cartalogo_session');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/admins/login');
      if (!isLoginRequest) {
        localStorage.removeItem('cartalogo_session');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
