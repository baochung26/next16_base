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

  const normalizedEmail = email?.toLowerCase();
  const normalizedUsername = username?.toLowerCase();

  const adminEmails = ADMIN_CONFIG.EMAILS as readonly string[];
  const adminUsernames = ADMIN_CONFIG.USERNAMES as readonly string[];

  return Boolean(
    (normalizedEmail && adminEmails.includes(normalizedEmail)) ||
      (normalizedUsername && adminUsernames.includes(normalizedUsername))
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
 * Lấy tên hiển thị: ưu tiên firstName + lastName, không có thì dùng phần trước @ của email.
 */
export function getUserDisplayName(
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null
): string {
  if (firstName || lastName) {
    return `${firstName || ""} ${lastName || ""}`.trim() || email?.split("@")[0] || "User";
  }
  return email?.split("@")[0] || "User";
}

/**
 * Lấy chữ cái đầu cho avatar: ưu tiên firstName[0]+lastName[0], không có thì email[0].
 */
export function getUserInitials(
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null
): string {
  if (firstName || lastName) {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    if (first && last) return first + last;
    if (first) return first;
    if (last) return last;
  }
  if (email) return email[0].toUpperCase();
  return "U";
}
