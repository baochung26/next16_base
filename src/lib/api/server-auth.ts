import { cookies } from "next/headers";
import { getUserById, type User } from "@/lib/db";
import { isAdmin } from "@/lib/utils/auth";

/**
 * Get current user from token (server-side)
 * This works with fake API tokens
 * When using real backend, this will validate JWT token
 */
export async function getServerUser(): Promise<User | null> {
  try {
    // Get token from cookies (set by client after login)
    // In real backend, this will be in Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return null;
    }

    // For fake API: Extract user ID from token
    // Format: fake-jwt-token-{userId}|{random}
    if (token.startsWith("fake-jwt-token-")) {
      const tokenWithoutPrefix = token.replace("fake-jwt-token-", "");
      const parts = tokenWithoutPrefix.split("|");
      if (parts.length >= 1 && parts[0]) {
        const userId = parts[0];
        const user = getUserById(userId);
        return user || null;
      }
    }

    // For real JWT: Decode token to get user ID
    // TODO: Implement JWT decoding when using real backend
    return null;
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
}

/**
 * Require authentication - redirects if not authenticated
 */
export async function requireServerAuth(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Check if user is admin (server-side)
 */
export async function requireServerAdmin(): Promise<User> {
  const user = await requireServerAuth();
  const userIsAdmin = isAdmin(user.email, user.username || undefined);
  if (!userIsAdmin) {
    throw new Error("Forbidden");
  }
  return user;
}
