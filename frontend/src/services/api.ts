import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Your Django Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Attach Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qms_token'); // Get token saved during Login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;