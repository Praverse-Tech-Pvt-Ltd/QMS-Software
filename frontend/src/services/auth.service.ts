export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
};

const USERS_KEY = "qms_users";
const TOKEN_KEY = "qms_token";
const USER_KEY = "qms_user";
const TOKEN_VALUE = "mock-token";

function getUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const authService = {
  signup(payload: SignupPayload) {
    const users = getUsers();

    const exists = users.find((u) => u.email === payload.email);
    if (exists) {
      throw new Error("User already exists with this email.");
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    };

    users.push(newUser);
    saveUsers(users);

    // unified auth state
    localStorage.setItem(TOKEN_KEY, TOKEN_VALUE);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email: payload.email,
        name: payload.fullName,
        role: "QA",
      }),
    );

    return true;
  },

  login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    localStorage.setItem(TOKEN_KEY, TOKEN_VALUE);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email,
        name: "Demo User",
        role: "QA",
      }),
    );

    return true;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) === TOKEN_VALUE;
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};
