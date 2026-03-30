/**
 * Token management utilities
 * Handles storing and retrieving JWT tokens (localStorage) and
 * accessToken cookie for server-side (middleware, RSC).
 */

import { APP_CONFIG } from "@/lib/constants";
import type { User } from "@/types/api";

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
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    // Verify đã lưu thành công
    const saved = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!saved || saved !== token) {
      console.error("Failed to save accessToken to localStorage");
      throw new Error("Không thể lưu token vào localStorage");
    }
  } catch (error) {
    console.error("Error saving accessToken to localStorage:", error);
    if (error instanceof DOMException && error.code === 22) {
      console.warn("localStorage is full or disabled. Token will not persist.");
    } else {
      throw error;
    }
  }
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
export function setUserInfo(user: Partial<User>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    // Verify đã lưu thành công
    const saved = localStorage.getItem(USER_INFO_KEY);
    if (!saved) {
      console.error("Failed to save userInfo to localStorage");
      throw new Error("Không thể lưu thông tin user vào localStorage");
    }
  } catch (error) {
    console.error("Error saving userInfo to localStorage:", error);
    // Nếu localStorage bị block (incognito, private mode), vẫn tiếp tục nhưng log warning
    if (error instanceof DOMException && error.code === 22) {
      console.warn("localStorage is full or disabled. User info will not persist.");
    } else {
      throw error;
    }
  }
}

/**
 * Get user info from localStorage (cache)
 */
export function getUserInfo(): Partial<User> | null {
  if (typeof window === "undefined") return null;
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  if (!userInfo) return null;
  try {
    return JSON.parse(userInfo) as Partial<User>;
  } catch {
    return null;
  }
}
