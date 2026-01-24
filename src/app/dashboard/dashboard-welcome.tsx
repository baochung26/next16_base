"use client";

import { useAuth } from "@/contexts/auth-context";
import { getUserDisplayName } from "@/lib/utils/auth";

export function DashboardWelcome() {
  const { user } = useAuth();

  const displayName = user
    ? getUserDisplayName(
        user.name,
        user.email,
        user.firstName,
        user.lastName
      )
    : "Admin";

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">
        Chào mừng trở lại, {displayName}!
      </h2>
      <p className="text-muted-foreground">
        Đây là tổng quan về hệ thống của bạn
      </p>
    </div>
  );
}
