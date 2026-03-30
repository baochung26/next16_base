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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserStats } from "@/components/dashboard/users/user-stats";
import { UserFilters } from "@/components/dashboard/users/user-filters";
import { UserTable } from "@/components/dashboard/users/user-table";
import { UserPagination } from "@/components/dashboard/users/user-pagination";
import { UserEditDialog } from "@/components/dashboard/users/user-edit-dialog";
import { UserDeleteDialog } from "@/components/dashboard/users/user-delete-dialog";
import { UserAddDialog } from "@/components/dashboard/users/user-add-dialog";
import type { UserFormData } from "@/components/dashboard/users/user-edit-dialog";
import type { AddUserFormData } from "@/components/dashboard/users/user-add-dialog";
import {
  APP_CONFIG,
  DEBOUNCE,
  FILTER_VALUES,
  SORT_ORDER,
} from "@/lib/constants";

export default function UsersPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"user" | "admin" | "all">(
    FILTER_VALUES.ALL as "all"
  );
  const [isActiveFilter, setIsActiveFilter] = useState<
    "all" | "true" | "false"
  >(FILTER_VALUES.ALL as "all");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "email" | "firstName" | "lastName" | "role" | "isActive"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(SORT_ORDER.DESC);

  // Pagination meta from API
  const [paginationMeta, setPaginationMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, DEBOUNCE.INPUT);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await userService.searchUsers({
          search: debouncedSearch || undefined,
          role: roleFilter !== FILTER_VALUES.ALL ? roleFilter : undefined,
          isActive:
            isActiveFilter !== FILTER_VALUES.ALL
              ? isActiveFilter === FILTER_VALUES.TRUE
              : undefined,
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
  }, [
    debouncedSearch,
    roleFilter,
    isActiveFilter,
    currentPage,
    sortBy,
    sortOrder,
    itemsPerPage,
    toast,
  ]);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleActivate = useCallback(
    async (user: User) => {
      try {
        await userService.activateUser(user.id);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: true } : u))
        );
        toast({
          title: "Kích hoạt thành công",
          description: `Đã kích hoạt người dùng ${user.firstName} ${user.lastName}`,
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleDeactivate = useCallback(
    async (user: User) => {
      try {
        await userService.deactivateUser(user.id);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u))
        );
        toast({
          title: "Vô hiệu hóa thành công",
          description: `Đã vô hiệu hóa người dùng ${user.firstName} ${user.lastName}`,
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const onEditSubmit = useCallback(
    async (data: UserFormData) => {
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
        const updatedUser = await userService.updateUser(
          selectedUser.id,
          payload
        );

        setUsers((prev) =>
          prev.map((u) =>
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
        toast({
          title: "Lỗi",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedUser, toast]
  );

  const onAddSubmit = useCallback(
    async (data: AddUserFormData) => {
      setIsSubmitting(true);
      try {
        const newUser = await userService.createUser({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
        setUsers((prev) => [newUser, ...prev]);
        setPaginationMeta((prev) =>
          prev ? { ...prev, total: prev.total + 1 } : prev
        );
        toast({
          title: "Tạo thành công",
          description: `Đã tạo người dùng ${data.firstName} ${data.lastName}`,
        });
        setAddDialogOpen(false);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast, paginationMeta, itemsPerPage]
  );

  const onDeleteConfirm = useCallback(async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await userService.deleteUser(selectedUser.id);

      const deletedUserName = `${selectedUser.firstName} ${selectedUser.lastName}`;

      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

      const newTotalPages = paginationMeta
        ? Math.ceil((paginationMeta.total - 1) / itemsPerPage)
        : 1;
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
      toast({
        title: "Lỗi",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedUser, paginationMeta, currentPage, itemsPerPage, toast]);

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const totalPages = paginationMeta?.totalPages || 1;

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
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>

        {/* Stats */}
        <UserStats users={users} total={paginationMeta?.total} />

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
              <UserFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                isActiveFilter={isActiveFilter}
                onIsActiveFilterChange={setIsActiveFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onFilterChange={handleFilterChange}
              />
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
                      userService
                        .getAllUsers()
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
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
              />
            )}
          </CardContent>
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginationMeta={paginationMeta}
            onPageChange={setCurrentPage}
          />
        </Card>

        {/* Add User Dialog */}
        <UserAddDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={onAddSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Edit Dialog */}
        <UserEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onSubmit={onEditSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Delete Dialog */}
        <UserDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onConfirm={onDeleteConfirm}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
