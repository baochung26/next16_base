"use client";

import { getAccessToken } from "./token";
import { userService } from "@/services";
import { useEffect, useState } from "react";
import type { User } from "@/types/api";

/**
 * Get current user from token
 * This is a client-side hook for fake API
 * When using real backend, this will call /users/me endpoint
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch user from API
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, loading } = useCurrentUser();
  return { isAuthenticated: !!user, loading };
}
