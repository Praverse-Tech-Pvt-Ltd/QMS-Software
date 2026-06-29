import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // required to send/receive HttpOnly cookies for refresh token
});

// Attach access token from in-memory store on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: attempt silent token refresh via HttpOnly cookie, then retry once
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          "http://127.0.0.1:8000/api/auth/token/refresh/",
          {},
          { withCredentials: true }
        );
        setAccessToken(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        clearAccessToken();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const fetchDashboardStats = async () => {
  const response = await api.get("/dashboard/stats/");
  return response.data;
};

export const fetchMyTasks = async () => {
  const response = await api.get("/dashboard/tasks/");
  return response.data;
};

export default api;
