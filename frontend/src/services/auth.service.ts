import api from "./api";

// --- Types ---
export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// --- Keys ---
// We keep your existing keys so we don't break other parts of the app
const TOKEN_KEY = "qms_token";
const REFRESH_KEY = "qms_refresh_token";
const USER_KEY = "qms_user";

export const authService = {
  /**
   * 1. LOGIN (Connects to Django)
   */
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      // Django's 'TokenObtainPairView' expects 'username' and 'password'
      const response = await api.post("/auth/token/", {
        username: email, // We map the email input to the username field
        password: password,
      });

      // 1. Save Tokens
      localStorage.setItem(TOKEN_KEY, response.data.access);
      localStorage.setItem(REFRESH_KEY, response.data.refresh);

      // 2. Save User Info for the UI
      // Note: Standard Django JWT doesn't return the Name/Role. 
      // We store the email to keep the UI working. 
      // (Later, we can add a '/api/auth/me/' endpoint to get real details)
      const userPayload = {
        email: email,
        name: "Authenticated User", // Placeholder until we fetch real profile
        role: "Admin", // Defaulting to Admin/QA so you can see all features
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userPayload));

      return true;
    } catch (error: any) {
      console.error("Login Failed:", error.response?.data || error.message);
      throw new Error("Invalid credentials or server error.");
    }
  },

  /**
   * 2. SIGNUP (Optional - depends if you implemented registration in Backend)
   */
 async signup(payload: SignupPayload) {
    try {
      // ✅ FIX: Log the payload to silence the "value is never read" warning
      console.log("Signup attempted for:", payload.email); 

      /* // Future Backend Call:
      await api.post("/auth/register/", {
        username: payload.email,
        email: payload.email,
        password: payload.password,
        first_name: payload.fullName
      });
      */

      alert("Registration endpoint not active yet. Please login with your Superuser account.");
      return false; 

    } catch (error: any) {
      throw new Error("Registration failed.");
    }
  },
  /**
   * 3. LOGOUT
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Optional: Reload page to clear state
    window.location.reload();
  },

  /**
   * 4. CHECK AUTH
   */
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token; // Returns true if token exists
  },

  /**
   * 5. GET USER (For UI Display)
   */
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  
  /**
   * 6. GET TOKEN (Helper)
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
};