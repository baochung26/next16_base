import { cookies } from "next/headers";
import { isAdmin } from "@/lib/utils/auth";
import type { User } from "@/types/api";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Get current user from token (server-side)
 * Calls backend API to get user info from JWT token
 */
export async function getServerUser(): Promise<User | null> {
  try {
    // Get token from cookies (set by client after login)
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return null;
    }

    // GET /users/profile - response: { success, statusCode, message, data }
    try {
      const response = await fetch(`${BACKEND_API_URL}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const json = await response.json();
        const apiUser = json?.data || json;
        return {
          id: apiUser.id,
          email: apiUser.email,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          role: apiUser.role,
          isActive: apiUser.isActive,
          createdAt: apiUser.createdAt,
          updatedAt: apiUser.updatedAt,
        } as any as User;
      }
    } catch (apiError) {
      // If backend API fails, return null (will be handled by caller)
      console.error("Error fetching user from backend API:", apiError);
    }

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
 * If backend API /users/me is not available, this will fail
 * In that case, client-side check in DashboardLayout will handle it
 */
export async function requireServerAdmin(): Promise<User> {
  const user = await requireServerAuth();
  
  // Check if user has role property (from API)
  const userRole = (user as any).role;
  const userIsAdmin = isAdmin(
    user.email,
    user.username || undefined,
    userRole || undefined
  );
  
  if (!userIsAdmin) {
    throw new Error("Forbidden");
  }
  return user;
}
