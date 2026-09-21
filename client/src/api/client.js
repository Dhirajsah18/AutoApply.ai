import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('job_auto_token') || sessionStorage.getItem('job_auto_token');
    if (token && (token === 'null' || token === 'undefined')) {
      token = null;
    }

    if (token) {
      const cleanToken = token.replace(/^"(.*)"$/, '$1').trim();
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${cleanToken}`);
        config.headers.set('x-auth-token', cleanToken);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${cleanToken}`;
        config.headers['x-auth-token'] = cleanToken;
      }
    }

    // Allow browser/axios to set proper multipart boundary when sending FormData
    if (config.data instanceof FormData) {
      if (config.headers?.delete) {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid and on protected route
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('job_auto_token');
        localStorage.removeItem('job_auto_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
