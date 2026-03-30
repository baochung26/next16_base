"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  setAccessToken,
  setRefreshToken,
  setAccessTokenCookie,
  setUserInfo,
} from "@/lib/api/token";
import type { User } from "@/types/api";
import { ROUTES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * Parse user from callback query (backend gửi encoded_user_data).
 * Có thể là JSON string hoặc URL-encoded JSON.
 */
function parseUserFromCallback(userParam: string | null): User | null {
  if (!userParam || typeof userParam !== "string") return null;
  try {
    const decoded = decodeURIComponent(userParam);
    const data = JSON.parse(decoded) as Record<string, unknown>;
    return {
      id: String(data.id ?? ""),
      email: String(data.email ?? ""),
      firstName: String(data.firstName ?? data.first_name ?? ""),
      lastName: String(data.lastName ?? data.last_name ?? ""),
      role: String(data.role ?? "user"),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: String(data.createdAt ?? data.created_at ?? new Date().toISOString()),
      updatedAt: String(data.updatedAt ?? data.updated_at ?? new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshTokenParam = searchParams.get("refresh_token");
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setMessage(decodeURIComponent(errorParam) || "Đăng nhập thất bại.");
      return;
    }

    if (!accessToken) {
      setStatus("error");
      setMessage("Không nhận được token. Vui lòng thử đăng nhập lại.");
      return;
    }

    setAccessToken(accessToken);
    setAccessTokenCookie(accessToken);

    if (refreshTokenParam) {
      setRefreshToken(refreshTokenParam);
    }

    const user = parseUserFromCallback(userParam);
    if (user) {
      setUserInfo(user);
      setUser(user);
    }
    // Nếu backend không gửi user, AuthProvider.refetch() sẽ lấy từ GET /users/profile

    setStatus("success");
    setMessage("Đăng nhập thành công. Đang chuyển hướng...");

    const timer = setTimeout(() => {
      router.replace(ROUTES.HOME);
      router.refresh();
    }, 800);

    return () => clearTimeout(timer);
  }, [searchParams, setUser, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Đang xử lý đăng nhập</CardTitle>
            <CardDescription>
              Vui lòng đợi trong giây lát...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Đăng nhập thất bại
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href={ROUTES.AUTH.LOGIN}>Quay lại đăng nhập</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={ROUTES.HOME}>Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Đăng nhập thành công
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}
