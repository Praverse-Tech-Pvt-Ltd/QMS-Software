import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Your Django Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard/stats/');
  return response.data;
};

export const fetchMyTasks = async () => {
  const response = await api.get('/dashboard/tasks/');
  return response.data;
};

export default api;