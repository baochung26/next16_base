"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
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
import { userService, authService } from "@/services";
import { getErrorMessage } from "@/lib/api/error-handler";
import { clearTokens } from "@/lib/api/token";
import { useAuth } from "@/contexts/auth-context";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Key,
  Shield,
} from "lucide-react";
import type { User as UserType } from "@/types/api";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên").optional().or(z.literal("")),
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(30, "Username không được quá 30 ký tự")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email không hợp lệ"),
});

// Password change schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser, refetch } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileError("");
    setProfileSuccess(false);

    try {
      const updatedUser = await userService.updateProfile({
        name: data.name || undefined,
        username: data.username || undefined,
        email: data.email,
      });
      setUser(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      setProfileError(getErrorMessage(error));
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("File ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingAvatar(true);
    setProfileError("");

    try {
      await userService.uploadAvatar(file);
      await refetch(); // Refetch user data after avatar upload
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin tài khoản và cài đặt bảo mật
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative inline-block mx-auto mb-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || user.email}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <CardTitle className="text-xl">
                  {user.name || user.username || "User"}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  {user.username && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium capitalize">
                      {user.provider}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "profile"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "password"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đổi mật khẩu
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <CardContent className="space-y-4">
                      {profileError && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                          <XCircle className="h-4 w-4" />
                          {profileError}
                        </div>
                      )}
                      {profileSuccess && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <CheckCircle2 className="h-4 w-4" />
                          Cập nhật thành công!
                        </div>
                      )}

                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập tên của bạn"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        disabled={profileForm.formState.isSubmitting}
                      >
                        {profileForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                    <CardContent className="space-y-4">
                      {passwordError && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                          <XCircle className="h-4 w-4" />
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <CheckCircle2 className="h-4 w-4" />
                          Đổi mật khẩu thành công!
                        </div>
                      )}

                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu hiện tại</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Xác nhận mật khẩu</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        disabled={passwordForm.formState.isSubmitting}
                      >
                        {passwordForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang đổi...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" />
                            Đổi mật khẩu
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
