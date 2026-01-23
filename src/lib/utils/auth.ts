/**
 * Auth utility functions
 */

/**
 * Check if user is admin
 * Currently checks by email or username
 */
import { ADMIN_CONFIG } from "@/lib/constants";

export function isAdmin(
  email?: string | null,
  username?: string | null
): boolean {
  if (!email && !username) return false;

  return (
    (email && ADMIN_CONFIG.EMAILS.includes(email.toLowerCase())) ||
    (username && ADMIN_CONFIG.USERNAMES.includes(username.toLowerCase()))
  );
}

/**
 * Get user display name
 */
export function getUserDisplayName(
  name?: string | null,
  email?: string | null
): string {
  return name || email?.split("@")[0] || "User";
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(
  name?: string | null,
  email?: string | null
): string {
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
