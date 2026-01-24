/**
 * Auth utility functions
 */

/**
 * Check if user is admin
 * Checks by role first, falls back to email/username for backward compatibility
 */
import { ADMIN_CONFIG } from "@/lib/constants";
import type { User } from "@/types/api";

export function isAdmin(
  email?: string | null,
  username?: string | null,
  role?: string | null
): boolean {
  // Check by role first (new way)
  if (role) {
    return role.toLowerCase() === "admin";
  }

  // Fallback to email/username check (backward compatibility)
  if (!email && !username) return false;

  return (
    (email && ADMIN_CONFIG.EMAILS.includes(email.toLowerCase())) ||
    (username && ADMIN_CONFIG.USERNAMES.includes(username.toLowerCase()))
  );
}

/**
 * Check if user is admin from User object
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("isAdminUser check:", {
      email: user.email,
      username: user.username,
      role: user.role,
      result: isAdmin(user.email, user.username, user.role),
    });
  }
  
  return isAdmin(user.email, user.username, user.role);
}

/**
 * Get user display name
 * Supports both firstName/lastName format and legacy name format
 */
export function getUserDisplayName(
  name?: string | null,
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null
): string {
  // New format: firstName + lastName
  if (firstName || lastName) {
    return `${firstName || ""} ${lastName || ""}`.trim() || email?.split("@")[0] || "User";
  }
  // Legacy format: name
  return name || email?.split("@")[0] || "User";
}

/**
 * Get user initials for avatar
 * Supports both firstName/lastName format and legacy name format
 */
export function getUserInitials(
  name?: string | null,
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null
): string {
  // New format: firstName + lastName
  if (firstName || lastName) {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    if (first && last) {
      return first + last;
    }
    if (first) return first;
    if (last) return last;
  }
  
  // Legacy format: name
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
  
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}
