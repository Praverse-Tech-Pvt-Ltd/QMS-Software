// In-memory access token store — never persisted to localStorage or sessionStorage.
// This protects against XSS token theft (21 CFR Part 11 requirement).
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

export const clearAccessToken = () => {
  _accessToken = null;
};
