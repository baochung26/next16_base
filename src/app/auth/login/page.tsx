"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { AuthGuestGuard } from "@/components/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { authService } from "@/services";
import { getErrorMessage } from "@/lib/api/error-handler";
import {
  setAccessTokenCookie,
  setRefreshToken,
  setUserInfo,
} from "@/lib/api/token";
import type { LoginResponse, User } from "@/types/api";
import { TIMEOUT, getApiBaseUrl, API_ENDPOINTS } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

/**
 * Helper function để extract User từ LoginResponse
 */
function extractUserFromLoginResponse(response: LoginResponse): User {
  return {
    id: response.id,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    role: response.role,
    isActive: response.isActive,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const { loading, user, showContent } = useRedirectIfAuthenticated();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hiển thị thông báo đăng ký thành công
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess(true);
      const timer = setTimeout(
        () => setSuccess(false),
        TIMEOUT.SUCCESS_MESSAGE
      );
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Lưu thông tin đăng nhập vào storage và context
  const saveAuthData = useCallback(
    (response: LoginResponse) => {
      const userInfo = extractUserFromLoginResponse(response);

      // authService.login() đã lưu access_token vào localStorage rồi
      // Chỉ cần lưu cookie và refresh token (nếu có)
      setAccessTokenCookie(response.access_token);

      if (response.refresh_token) {
        setRefreshToken(response.refresh_token);
      }

      // Lưu user info và cập nhật context
      setUserInfo(userInfo);
      setUser(userInfo);
    },
    [setUser]
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof loginSchema>) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await authService.login({
          email: values.email,
          password: values.password,
        });

        // authService.login() đã validate và throw error nếu không có access_token
        saveAuthData(response);
        form.reset(); // Reset form sau khi login thành công
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthData, form]
  );

  const handleGoogleSignIn = () => {
    setError("");
    const apiBase = getApiBaseUrl();
    const googleAuthUrl = `${apiBase}${API_ENDPOINTS.AUTH.GOOGLE}`;
    window.location.href = googleAuthUrl;
  };

  if (!showContent) {
    return <AuthGuestGuard loading={loading} user={user} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              NextApp
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin của bạn để đăng nhập vào tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {success && (
                <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Đăng ký thành công! Vui lòng đăng nhập.
                </div>
              )}
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập với Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
