"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";

const REDIRECT_DELAY_MS = 1000;

/**
 * Hook dùng cho các trang auth (login, register, forgot-password, reset-password).
 * Khi user đã đăng nhập → delay ~1s rồi redirect về trang chủ bằng client-side navigation (không reload trang).
 *
 * @param redirectTo - Đường dẫn redirect khi đã đăng nhập (mặc định: ROUTES.HOME)
 * @returns { loading, user, showContent } - showContent = true khi chưa đăng nhập và không đang loading
 */
export function useRedirectIfAuthenticated(redirectTo: string = ROUTES.HOME) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      router.replace(redirectTo);
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [user, redirectTo, router]);

  return {
    loading,
    user,
    /** true khi chưa đăng nhập và không đang loading → có thể hiển thị form */
    showContent: !loading && !user,
  };
}
