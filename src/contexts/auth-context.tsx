"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userService } from "@/services";
import { getAccessToken } from "@/lib/api/token";
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

  const refetch = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

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
