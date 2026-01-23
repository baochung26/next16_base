import { getServerUser } from "./api/server-auth";
import { getUserById, type User } from "./db";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

/**
 * Get current user from token (server-side)
 * @deprecated Use getServerUser from @/lib/api/server-auth instead
 */
export async function getCurrentUser(): Promise<User | null> {
  return getServerUser();
}

/**
 * Get current user session (server-side)
 * @deprecated Use getServerUser from @/lib/api/server-auth instead
 */
export async function getCurrentSession(): Promise<{
  user: SessionUser;
} | null> {
  try {
    const user = await getServerUser();
    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
      },
    };
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
