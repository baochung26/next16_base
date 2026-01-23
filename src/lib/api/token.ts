/**
 * Token management utilities
 * Handles storing and retrieving JWT tokens
 */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_INFO_KEY = "userInfo"; // Store user info temporarily

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Remove all tokens
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * Check if user has token (is authenticated)
 */
export function hasToken(): boolean {
  return !!getAccessToken();
}

/**
 * Store user info temporarily (for fake API)
 * In real backend, user info will come from JWT token
 */
export function setUserInfo(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

/**
 * Get user info from localStorage
 */
export function getUserInfo(): any | null {
  if (typeof window === "undefined") return null;
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}
