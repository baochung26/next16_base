"use client";

import { Loader2 } from "lucide-react";

interface AuthGuestGuardProps {
  /** Đang kiểm tra auth (chưa có user) */
  loading: boolean;
  /** Đã đăng nhập → đang chuyển hướng */
  user: unknown;
}

/**
 * Hiển thị loading hoặc "Đang chuyển hướng..." cho các trang auth
 * khi user đã đăng nhập hoặc đang kiểm tra auth.
 * Dùng cùng với useRedirectIfAuthenticated.
 */
export function AuthGuestGuard({ loading, user }: AuthGuestGuardProps) {
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    );
  }

  return null;
}
