import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or blacklisted, clear session and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }

    let message =
      error.response?.data?.detail ||
      error.response?.data?.message;

    if (!message) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message = 'Cannot reach backend server. Please verify the FastAPI server is running on http://127.0.0.1:8000';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Request timed out. The server or MongoDB cluster took too long to respond.';
      } else {
        message = error.message || 'Something went wrong';
      }
    }
    console.error('[API Error]', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
