"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { userService } from "@/services";
import { getErrorMessage } from "@/lib/api/error-handler";
import type { User } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  User,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const userSchema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["user", "admin"]),
  isActive: z.boolean(),
  password: z
    .union([
      z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
      z.literal(""),
    ])
    .optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"user" | "admin" | "all">("all");
  const [isActiveFilter, setIsActiveFilter] = useState<"all" | "true" | "false">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "email" | "firstName" | "lastName" | "role" | "isActive">("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  
  // Pagination meta from API
  const [paginationMeta, setPaginationMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use API pagination (always available now since we always use search API)
  const totalPages = paginationMeta?.totalPages || 1;
  const currentUsers = users; // Users are already paginated from API

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        // Always use search API to get pagination support
        const result = await userService.searchUsers({
          search: debouncedSearch || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          isActive: isActiveFilter !== "all" ? isActiveFilter === "true" : undefined,
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          sortOrder,
        });
        setUsers(result.users);
        setPaginationMeta(result.meta);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch, roleFilter, isActiveFilter, currentPage, sortBy, sortOrder, itemsPerPage, toast]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      isActive: true,
      password: "",
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as "user" | "admin",
      isActive: user.isActive,
      password: "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleActivate = async (user: User) => {
    try {
      await userService.activateUser(user.id);
      
      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, isActive: true } : u
        )
      );

      toast({
        title: "Kích hoạt thành công",
        description: `Đã kích hoạt người dùng ${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      console.error("Error activating user:", error);
      toast({
        title: "Lỗi",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (user: User) => {
    try {
      await userService.deactivateUser(user.id);
      
      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, isActive: false } : u
        )
      );

      toast({
        title: "Vô hiệu hóa thành công",
        description: `Đã vô hiệu hóa người dùng ${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast({
        title: "Lỗi",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: UserFormData) => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        ...(data.password && data.password.trim()
          ? { password: data.password.trim() }
          : {}),
      };
      const updatedUser = await userService.updateUser(selectedUser.id, payload);

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...updatedUser } : u
        )
      );

      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật thông tin người dùng ${data.firstName} ${data.lastName}`,
      });

      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Lỗi",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      // Call delete user API
      await userService.deleteUser(selectedUser.id);

      const deletedUserName = `${selectedUser.firstName} ${selectedUser.lastName}`;
      
      // Update local state after successful deletion
      const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
      setUsers(updatedUsers);

      // Adjust page if current page is empty after deletion
      const newTotalPages = Math.ceil(updatedUsers.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      toast({
        title: "Xóa thành công",
        description: `Đã xóa người dùng ${deletedUserName}`,
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Lỗi",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Quản lý người dùng
            </h2>
            <p className="text-muted-foreground">
              Quản lý và theo dõi tất cả người dùng trong hệ thống
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paginationMeta?.total ?? users.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {paginationMeta ? "Tổng số kết quả" : "Tổng số người dùng"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đang hoạt động
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {users.length > 0
                  ? Math.round((users.filter((u) => u.isActive).length / users.length) * 100)
                  : 0}% trong danh sách
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Không hoạt động
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => !u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Trong danh sách</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </div>
              <p className="text-xs text-muted-foreground">Trong danh sách</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách người dùng</CardTitle>
                <CardDescription>
                  Tất cả người dùng đã đăng ký trong hệ thống
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm email, tên..."
                    className="pl-8 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as "user" | "admin" | "all");
                    setCurrentPage(1);
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={isActiveFilter}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value as "all" | "true" | "false");
                    setCurrentPage(1);
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as typeof sortBy);
                    setCurrentPage(1);
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="createdAt">Ngày tạo</option>
                  <option value="updatedAt">Ngày cập nhật</option>
                  <option value="email">Email</option>
                  <option value="firstName">Tên</option>
                  <option value="lastName">Họ</option>
                  <option value="role">Vai trò</option>
                  <option value="isActive">Trạng thái</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "ASC" | "DESC");
                    setCurrentPage(1);
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="DESC">Giảm dần</option>
                  <option value="ASC">Tăng dần</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setError("");
                      // Retry fetch
                      userService.getAllUsers()
                        .then(setUsers)
                        .catch((err) => setError(getErrorMessage(err)))
                        .finally(() => setLoading(false));
                    }}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Không có người dùng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium">
                        Người dùng
                      </th>
                      <th className="text-left p-4 text-sm font-medium">Email</th>
                      <th className="text-left p-4 text-sm font-medium">
                        Vai trò
                      </th>
                      <th className="text-left p-4 text-sm font-medium">
                        Trạng thái
                      </th>
                      <th className="text-left p-4 text-sm font-medium">
                        Ngày tạo
                      </th>
                      <th className="text-right p-4 text-sm font-medium">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                              user.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            }`}
                          >
                            {user.isActive ? "Hoạt động" : "Không hoạt động"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              {user.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivate(user)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Vô hiệu hóa
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleActivate(user)}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Kích hoạt
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className="border-t px-6 py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {paginationMeta ? (
                  <>
                    Hiển thị {(paginationMeta.page - 1) * paginationMeta.limit + 1}-
                    {Math.min(
                      paginationMeta.page * paginationMeta.limit,
                      paginationMeta.total
                    )}{" "}
                    trong tổng số {paginationMeta.total} người dùng
                  </>
                ) : (
                  <>
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, users.length)}{" "}
                    trong tổng số {users.length} người dùng
                  </>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin người dùng. Nhấn Lưu để hoàn tất.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Văn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                          {...field}
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
                      <FormLabel>Mật khẩu mới (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Để trống nếu không đổi mật khẩu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <FormControl>
                          <select
                            value={field.value ? "true" : "false"}
                            onChange={(e) => field.onChange(e.target.value === "true")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="true">Hoạt động</option>
                            <option value="false">Không hoạt động</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>
                  {selectedUser
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : ""}
                </strong>
                ? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onDeleteConfirm}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
