import axios from 'axios';

// Create custom axios instance
const api = axios.create({
  baseURL: '/api', // This will use the proxy configured in vite.config.js
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for error handling
api.interceptors.request.use(
  config => {
    // Add any auth headers if needed
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData?.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 