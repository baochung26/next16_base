/**
 * Token management utilities
 * Handles storing and retrieving JWT tokens (localStorage) and
 * accessToken cookie for server-side (middleware, RSC).
 */

import { APP_CONFIG } from "@/lib/constants";

const ACCESS_TOKEN_KEY = APP_CONFIG.SESSION.TOKEN_KEY;
const REFRESH_TOKEN_KEY = APP_CONFIG.SESSION.REFRESH_TOKEN_KEY;
const USER_INFO_KEY = APP_CONFIG.SESSION.USER_INFO_KEY;
const COOKIE_MAX_AGE = APP_CONFIG.SESSION.COOKIE_MAX_AGE;

function isHttps(): boolean {
  return typeof window !== "undefined" && window.location?.protocol === "https:";
}

function cookieSecureSuffix(): string {
  return isHttps() ? "; Secure" : "";
}

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
 * Remove all tokens (localStorage only)
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * Set accessToken in cookie for server-side (middleware, RSC).
 * - path=/, max-age, SameSite=Lax
 * - Secure when on HTTPS (production)
 * Lưu ý: Không thể dùng HttpOnly khi set qua document.cookie; muốn HttpOnly cần set
 * từ API Route qua header Set-Cookie.
 */
export function setAccessTokenCookie(token: string): void {
  if (typeof window === "undefined") return;
  const secure = cookieSecureSuffix();
  document.cookie = `accessToken=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

/**
 * Xóa cookie auth (accessToken, refreshToken).
 * Dùng cùng path và Secure (khi HTTPS) để trình duyệt khớp và xóa đúng.
 */
export function clearAuthCookies(): void {
  if (typeof window === "undefined") return;
  const secure = cookieSecureSuffix();
  document.cookie = `accessToken=; path=/; max-age=0${secure}`;
  document.cookie = `refreshToken=; path=/; max-age=0${secure}`;
}

/**
 * Check if user has token (is authenticated)
 */
export function hasToken(): boolean {
  return !!getAccessToken();
}

/**
 * Store user info temporarily (cache)
 * User info comes from backend API /users/me
 */
export function setUserInfo(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

/**
 * Get user info from localStorage (cache)
 */
export function getUserInfo(): any | null {
  if (typeof window === "undefined") return null;
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}
