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

    // create dummy token
    localStorage.setItem(TOKEN_KEY, "demo");
    return newUser;
  },

  login(payload: LoginPayload) {
    const users = getUsers();

    const user = users.find(
      (u) => u.email === payload.email && u.password === payload.password
    );

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    localStorage.setItem(TOKEN_KEY, "demo");
    return user;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) === "demo";
  },
};
