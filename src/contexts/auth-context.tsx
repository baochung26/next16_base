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

  const refetch = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // First, try to get user from localStorage (cached from login)
      // This provides instant UI update while API call is in progress
      const cachedUser = getUserInfo();
      if (cachedUser) {
        // Map cached user to User type for immediate UI update
        const userData: User = {
          id: cachedUser.id || "",
          email: cachedUser.email || "",
          firstName: cachedUser.firstName || "",
          lastName: cachedUser.lastName || "",
          role: cachedUser.role || "user",
          isActive: cachedUser.isActive !== undefined ? cachedUser.isActive : true,
          createdAt: cachedUser.createdAt || new Date().toISOString(),
          updatedAt: cachedUser.updatedAt || new Date().toISOString(),
        };
        setUser(userData);
        // Don't set loading to false yet - we'll update from API
      }

      // Always try to get fresh data from API
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        setUserInfo(userData); // Sync cache để refresh/đóng mở tab vẫn đúng
      } catch (apiError: unknown) {
        const error = apiError as { statusCode?: number };
        
        // If it's a 401, refresh token đã được xử lý trong axios interceptor
        // Nếu vẫn nhận 401 ở đây nghĩa là refresh token cũng hết hạn hoặc không có
        // → Clear tokens và logout
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
        
        // For other errors, log but keep cached user if available
        console.error("Error fetching user from API:", apiError);
        // Nếu có cached user, giữ lại để UI vẫn hoạt động
        // Nếu không có cache, set user = null
        if (!cachedUser) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Nếu có cached user, giữ lại để UI vẫn hoạt động
      const cachedUser = getUserInfo();
      if (!cachedUser) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
