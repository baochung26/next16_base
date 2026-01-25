"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { userService } from "@/services";
import { getAccessToken, getUserInfo, setUserInfo } from "@/lib/api/token";
import type { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Provides authentication state to the entire app
 *
 * This context manages:
 * - Current user data
 * - Authentication status
 * - Loading state
 * - User data refetching
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track if /users/me endpoint is available
  // Once we know it's not available (404/500), we won't call it again
  const [endpointAvailable, setEndpointAvailable] = useState<boolean | null>(null);

  const refetch = useCallback(async (forceRefresh = false) => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // First, try to get user from localStorage (cached from login)
      // This avoids unnecessary API calls when endpoint doesn't exist
      const cachedUser = getUserInfo();
      if (cachedUser && !forceRefresh) {
        // Map cached user to User type
        const userData: User = {
          id: cachedUser.id,
          email: cachedUser.email,
          firstName: cachedUser.firstName || "",
          lastName: cachedUser.lastName || "",
          role: cachedUser.role || "user", // Ensure role is preserved
          isActive: cachedUser.isActive !== undefined ? cachedUser.isActive : true,
          createdAt: cachedUser.createdAt || new Date().toISOString(),
          updatedAt: cachedUser.updatedAt || new Date().toISOString(),
        };
        
        // Debug: log cached user info
        if (process.env.NODE_ENV === "development") {
          console.log("Loading user from cache:", {
            cachedUser,
            mappedUser: userData,
            role: userData.role,
          });
        }
        
        setUser(userData);
        setLoading(false);
        
        // Don't call API if we have cached user and endpoint is known to be unavailable
        // or if we haven't checked yet (will check on next page load if needed)
        if (endpointAvailable === false) {
          return;
        }
        
        // If endpoint availability is unknown, don't call it to avoid errors
        // User info from login response is sufficient
        return;
      }

      // Only try API if:
      // 1. We don't have cached user, OR
      // 2. We're forcing a refresh AND endpoint is known to be available
      if (endpointAvailable === false) {
        // Endpoint is known to be unavailable, use cached user or set to null
        if (cachedUser) {
          const userData: User = {
            id: cachedUser.id,
            email: cachedUser.email,
            firstName: cachedUser.firstName || "",
            lastName: cachedUser.lastName || "",
            role: cachedUser.role || "user",
            isActive: cachedUser.isActive !== undefined ? cachedUser.isActive : true,
            createdAt: cachedUser.createdAt || new Date().toISOString(),
            updatedAt: cachedUser.updatedAt || new Date().toISOString(),
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      // Try to get from API only if endpoint might be available
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        setUserInfo(userData); // đồng bộ cache để refresh/đóng mở tab vẫn đúng
        setEndpointAvailable(true); // Mark endpoint as available
      } catch (apiError: unknown) {
        const error = apiError as { statusCode?: number };
        
        // If API call fails (404/500), endpoint doesn't exist yet
        if (error?.statusCode === 404 || error?.statusCode === 500) {
          setEndpointAvailable(false); // Mark endpoint as unavailable
          console.warn("Backend endpoint /users/me not available, using cached user info");
          
          // Use cached user if available
          if (cachedUser) {
            const userData: User = {
              id: cachedUser.id,
              email: cachedUser.email,
              firstName: cachedUser.firstName || "",
              lastName: cachedUser.lastName || "",
              role: cachedUser.role || "user",
              isActive: cachedUser.isActive !== undefined ? cachedUser.isActive : true,
              createdAt: cachedUser.createdAt || new Date().toISOString(),
              updatedAt: cachedUser.updatedAt || new Date().toISOString(),
            };
            setUser(userData);
          } else {
            // No cached user and API fails - user not authenticated
            setUser(null);
          }
          setLoading(false);
          return;
        }
        
        // If it's a 401, clear the token and user
        if (error?.statusCode === 401) {
          try {
            const { clearTokens } = await import("@/lib/api/token");
            clearTokens();
          } catch (e) {
            console.error("Error clearing tokens:", e);
          }
          setUser(null);
          setLoading(false);
          return;
        }
        
        // For other errors, log but don't throw - just set user to null
        console.error("Error fetching user from API:", apiError);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [endpointAvailable]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    refetch,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Hook to access authentication context
 *
 * @returns AuthContextType with user, loading, isAuthenticated, refetch, setUser
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { user, loading, isAuthenticated } = useAuth();
 *
 *   if (loading) return <Loading />;
 *   if (!isAuthenticated) return <Login />;
 *
 *   return <div>Hello {user.name}</div>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
