import api from "./api";
import { setAccessToken, clearAccessToken, getAccessToken } from "./tokenStore";

// User/role stored in sessionStorage — clears on tab close (21 CFR Part 11 compliance).
// Access token is NEVER stored in browser storage; it lives only in JS memory.
const USER_KEY = "qms_user";
const ROLE_KEY = "qms_role";
const MUST_CHANGE_PASSWORD_KEY = "qms_must_change_password";

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const authService = {
  async login(email: string, password: string) {
    if (!email || !password) throw new Error("Email and password are required");

    const response = await api.post("/auth/token/", {
      username: email,
      password: password,
    });

    // Access token stored in memory only — never in localStorage
    setAccessToken(response.data.access);

    const userPayload = {
      email,
      name: response.data.user_full_name || "QMS User",
      role: response.data.role || "Viewer",
      mustChangePassword: !!response.data.must_change_password,
    };
    // User identity stored in sessionStorage (clears on tab close)
    sessionStorage.setItem(USER_KEY, JSON.stringify(userPayload));
    sessionStorage.setItem(ROLE_KEY, userPayload.role);
    sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, String(userPayload.mustChangePassword));

    return userPayload;
  },

  /**
   * signup() is intentionally not implemented.
   * User accounts are provisioned by a system administrator via Django admin.
   * Self-registration is not supported in validated GMP systems.
   * Do not implement without QA approval and a formal change control record.
   */
  async signup(payload: SignupPayload) {
    console.log("Signup attempted for:", payload.email);
    alert("Registration endpoint not active yet. Please login with your Superuser account.");
    return false;
  },

  logout() {
    clearAccessToken();
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
    window.location.href = "/login";
  },

  isAuthenticated() {
    // Check in-memory token (memory is set either by login or by silent refresh on load)
    return !!getAccessToken();
  },

  getUser() {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getRole() {
    return sessionStorage.getItem(ROLE_KEY);
  },

  getMustChangePassword() {
    return sessionStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === "true";
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await api.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "false");
  },

  // Called on app init to silently restore the access token via HttpOnly refresh cookie
  async silentRefresh(): Promise<boolean> {
    try {
      const { data } = await api.post("/auth/token/refresh/");
      setAccessToken(data.access);
      return true;
    } catch {
      return false;
    }
  },
};
