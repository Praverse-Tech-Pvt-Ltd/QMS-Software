import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";
import { getSelectedSite } from "./siteStore";

// Host must match the frontend's host (localhost), or the browser treats the API as
// cross-site and won't send the HttpOnly refresh cookie — sessions die on reload.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // required to send/receive HttpOnly cookies for refresh token
});

// Attach access token from in-memory store on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Multi-site filtering (Phase 6 Block 7): auto-inject ?site=<id> on GET list
  // calls when a site is selected, unless the caller already set one explicitly.
  const siteId = getSelectedSite();
  if (siteId && config.method === "get") {
    config.params = { site: siteId, ...(config.params || {}) };
  }

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
          `${API_BASE_URL}/auth/token/refresh/`,
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
