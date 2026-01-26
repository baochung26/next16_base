# Hướng dẫn tối ưu Source Code

Tài liệu tổng hợp các điểm có thể tối ưu trong project, đặc biệt tập trung vào các page và components.

---

## 📋 Mục lục

1. [Tách Component lớn thành nhỏ hơn](#1-tách-component-lớn-thành-nhỏ-hơn)
2. [Tối ưu Performance (Memoization)](#2-tối-ưu-performance-memoization)
3. [Tách Logic thành Custom Hooks](#3-tách-logic-thành-custom-hooks)
4. [Giảm Code Duplication](#4-giảm-code-duplication)
5. [Cải thiện Type Safety](#5-cải-thiện-type-safety)
6. [Tối ưu Data Fetching](#6-tối-ưu-data-fetching)
7. [Cải thiện Constants & Magic Values](#7-cải-thiện-constants--magic-values)
8. [Tối ưu Form Handling](#8-tối-ưu-form-handling)
9. [Tối ưu Error Handling](#9-tối-ưu-error-handling)
10. [Checklist Tối ưu](#10-checklist-tối-ưu)

---

## 1. Tách Component lớn thành nhỏ hơn

### ❌ Vấn đề hiện tại

**`src/app/dashboard/users/page.tsx`** - **903 dòng** - quá lớn, khó maintain:

- Chứa quá nhiều logic: state management, form handling, table rendering, dialogs, filters, pagination
- Khó test từng phần riêng
- Khó reuse các phần (table, filters, stats cards)

### ✅ Giải pháp: Tách thành components nhỏ

#### 1.1. Tách Stats Cards

```tsx
// src/components/dashboard/users/user-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";
import type { User as UserType } from "@/types/api";

interface UserStatsProps {
  users: UserType[];
  total?: number;
}

export function UserStats({ users, total }: UserStatsProps) {
  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const activePercentage = users.length > 0 
    ? Math.round((activeCount / users.length) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total ?? users.length}</div>
          <p className="text-xs text-muted-foreground">
            {total ? "Tổng số kết quả" : "Tổng số người dùng"}
          </p>
        </CardContent>
      </Card>
      {/* ... các card khác */}
    </div>
  );
}
```

#### 1.2. Tách Filters Component

```tsx
// src/components/dashboard/users/user-filters.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: "user" | "admin" | "all";
  onRoleFilterChange: (value: "user" | "admin" | "all") => void;
  isActiveFilter: "all" | "true" | "false";
  onIsActiveFilterChange: (value: "all" | "true" | "false") => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (value: "ASC" | "DESC") => void;
  onFilterChange: () => void; // Reset to page 1
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  // ... other props
  onFilterChange,
}: UserFiltersProps) {
  const handleRoleChange = (value: string) => {
    onRoleFilterChange(value as "user" | "admin" | "all");
    onFilterChange();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm email, tên..."
          className="pl-8 w-64"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {/* ... các select filters */}
    </div>
  );
}
```

#### 1.3. Tách User Table Component

```tsx
// src/components/dashboard/users/user-table.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, XCircle, CheckCircle2 } from "lucide-react";
import type { User } from "@/types/api";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onActivate: (user: User) => void;
  onDeactivate: (user: User) => void;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* ... table structure */}
      </table>
    </div>
  );
}
```

#### 1.4. Tách Edit/Delete Dialogs

```tsx
// src/components/dashboard/users/user-edit-dialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
// ... imports

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting,
}: UserEditDialogProps) {
  // ... form logic
  return <Dialog open={open} onOpenChange={onOpenChange}>...</Dialog>;
}
```

**Kết quả:** `users/page.tsx` giảm từ **903 dòng** → **~200-300 dòng**, dễ maintain hơn.

---

## 2. Tối ưu Performance (Memoization)

### ❌ Vấn đề hiện tại

- **Thiếu `useMemo`** cho computed values (filtered users, pagination, stats)
- **Thiếu `useCallback`** cho event handlers → tạo function mới mỗi render
- **Thiếu `React.memo`** cho components nhận props không đổi

### ✅ Giải pháp

#### 2.1. Memoize Computed Values

```tsx
// ❌ Bad: Tính lại mỗi render
const activeUsers = users.filter((u) => u.isActive);
const totalPages = Math.ceil(users.length / itemsPerPage);

// ✅ Good: Memoize
const activeUsers = useMemo(
  () => users.filter((u) => u.isActive),
  [users]
);

const totalPages = useMemo(
  () => Math.ceil(users.length / itemsPerPage),
  [users.length, itemsPerPage]
);

// Filtered & sorted users
const filteredUsers = useMemo(() => {
  let result = users;
  
  // Search filter
  if (debouncedSearch) {
    const searchLower = debouncedSearch.toLowerCase();
    result = result.filter(
      (u) =>
        u.email.toLowerCase().includes(searchLower) ||
        u.firstName.toLowerCase().includes(searchLower) ||
        u.lastName.toLowerCase().includes(searchLower)
    );
  }
  
  // Role filter
  if (roleFilter !== "all") {
    result = result.filter((u) => u.role === roleFilter);
  }
  
  // Active filter
  if (isActiveFilter !== "all") {
    result = result.filter((u) => u.isActive === (isActiveFilter === "true"));
  }
  
  // Sort
  result.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === "ASC" ? comparison : -comparison;
  });
  
  return result;
}, [users, debouncedSearch, roleFilter, isActiveFilter, sortBy, sortOrder]);

// Paginated users
const currentUsers = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredUsers.slice(start, start + itemsPerPage);
}, [filteredUsers, currentPage, itemsPerPage]);
```

#### 2.2. Memoize Event Handlers

```tsx
// ❌ Bad: Tạo function mới mỗi render
<Button onClick={() => handleEdit(user)}>Edit</Button>

// ✅ Good: useCallback
const handleEdit = useCallback((user: User) => {
  setSelectedUser(user);
  setEditDialogOpen(true);
  editForm.reset({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
}, [editForm]);

const handleDelete = useCallback((user: User) => {
  setSelectedUser(user);
  setDeleteDialogOpen(true);
}, []);

// Trong render
<Button onClick={() => handleEdit(user)}>Edit</Button>
```

#### 2.3. Memoize Components

```tsx
// src/components/dashboard/users/user-table-row.tsx
"use client";

import { memo } from "react";
import type { User } from "@/types/api";

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onActivate: (user: User) => void;
  onDeactivate: (user: User) => void;
}

export const UserTableRow = memo(function UserTableRow({
  user,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: UserTableRowProps) {
  return (
    <tr className="border-b hover:bg-muted/50">
      {/* ... row content */}
    </tr>
  );
});
```

---

## 3. Tách Logic thành Custom Hooks

### ❌ Vấn đề hiện tại

- Logic lặp lại ở nhiều page (fetching, filtering, pagination, toast)
- Khó test logic riêng
- Khó reuse

### ✅ Giải pháp: Custom Hooks

#### 3.1. Hook cho User Management

```tsx
// src/hooks/use-users.ts
import { useState, useEffect, useCallback } from "react";
import { userService } from "@/services";
import { getErrorMessage } from "@/lib/api/error-handler";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/api";

export function useUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getAllUsers();
      setUsers(data);
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
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, payload: Partial<User>) => {
    try {
      const updated = await userService.updateUser(id, payload);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
  };
}
```

#### 3.2. Hook cho Search & Filter

```tsx
// src/hooks/use-search-filter.ts
import { useState, useEffect, useMemo } from "react";

export function useSearchFilter<T>(
  items: T[],
  searchKeys: (keyof T)[],
  debounceMs: number = 300
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return items;
    
    const searchLower = debouncedSearch.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return value && String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [items, debouncedSearch, searchKeys]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}
```

#### 3.3. Hook cho Pagination

```tsx
// src/hooks/use-pagination.ts
import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage]
  );

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    setCurrentPage,
  };
}
```

**Sử dụng trong page:**

```tsx
// src/app/dashboard/users/page.tsx
export default function UsersPage() {
  const { users, loading, error, updateUser, deleteUser } = useUsers();
  const { searchQuery, setSearchQuery, filteredItems } = useSearchFilter(
    users,
    ["email", "firstName", "lastName"]
  );
  const { currentPage, totalPages, currentItems, goToPage } = usePagination(
    filteredItems,
    10
  );

  // ... rest of component
}
```

---

## 4. Giảm Code Duplication

### ❌ Vấn đề hiện tại

- **Toast patterns** lặp lại ở nhiều nơi
- **Error handling** giống nhau
- **Loading states** pattern giống nhau
- **Form validation** messages giống nhau

### ✅ Giải pháp

#### 4.1. Utility cho Toast

```tsx
// src/lib/utils/toast.ts
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/error-handler";

export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "default",
  });
}

export function showErrorToast(error: unknown, title: string = "Lỗi") {
  toast({
    title,
    description: getErrorMessage(error),
    variant: "destructive",
  });
}

export function showUserActionToast(
  action: "create" | "update" | "delete" | "activate" | "deactivate",
  userName: string,
  success: boolean = true
) {
  const messages = {
    create: { success: "Tạo thành công", error: "Lỗi khi tạo" },
    update: { success: "Cập nhật thành công", error: "Lỗi khi cập nhật" },
    delete: { success: "Xóa thành công", error: "Lỗi khi xóa" },
    activate: { success: "Kích hoạt thành công", error: "Lỗi khi kích hoạt" },
    deactivate: { success: "Vô hiệu hóa thành công", error: "Lỗi khi vô hiệu hóa" },
  };

  toast({
    title: success ? messages[action].success : messages[action].error,
    description: success ? `Đã ${action} người dùng ${userName}` : undefined,
    variant: success ? "default" : "destructive",
  });
}
```

#### 4.2. Component Loading/Error State

```tsx
// src/components/common/loading-error-state.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface LoadingErrorStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function LoadingErrorState({
  loading,
  error,
  onRetry,
  empty,
  emptyMessage = "Không có dữ liệu",
  children,
}: LoadingErrorStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive mb-2">{error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Thử lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 5. Cải thiện Type Safety

### ❌ Vấn đề hiện tại

- Một số chỗ dùng `any`
- Type assertions không an toàn
- Missing types cho props

### ✅ Giải pháp

```tsx
// ❌ Bad
const handleFilterChange = (value: string) => {
  setRoleFilter(value as "user" | "admin" | "all");
};

// ✅ Good: Type-safe
type RoleFilter = "user" | "admin" | "all";
const handleFilterChange = (value: RoleFilter) => {
  setRoleFilter(value);
};

// Hoặc dùng enum/const
export const ROLE_FILTERS = {
  ALL: "all",
  USER: "user",
  ADMIN: "admin",
} as const;

type RoleFilter = (typeof ROLE_FILTERS)[keyof typeof ROLE_FILTERS];
```

---

## 6. Tối ưu Data Fetching

### ❌ Vấn đề hiện tại

- Fetch lại mỗi khi component mount (không cache)
- Không có debounce cho search
- Fetch không cần thiết khi filter thay đổi

### ✅ Giải pháp

#### 6.1. Debounce Search

```tsx
// Đã có trong useSearchFilter hook (mục 3.2)
// Hoặc dùng thư viện: use-debounce
import { useDebounce } from "use-debounce";

const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearch] = useDebounce(searchQuery, 300);
```

#### 6.2. Cache với React Query (nếu cần)

```tsx
// Nếu project lớn, cân nhắc dùng React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAllUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## 7. Cải thiện Constants & Magic Values

### ❌ Vấn đề hiện tại

- Magic numbers: `10` (itemsPerPage), `300` (debounce), `5` (timeout seconds)
- Magic strings: `"user"`, `"admin"`, `"all"`, `"ASC"`, `"DESC"`

### ✅ Giải pháp

```tsx
// src/lib/constants.ts - Thêm vào
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const DEBOUNCE = {
  SEARCH: 300, // ms
  INPUT: 500,
} as const;

export const TIMEOUT = {
  SUCCESS_MESSAGE: 5000, // ms
  TOAST_REMOVE: 5000,
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const FILTER_VALUES = {
  ALL: "all",
  TRUE: "true",
  FALSE: "false",
} as const;

export const SORT_ORDER = {
  ASC: "ASC",
  DESC: "DESC",
} as const;
```

---

## 8. Tối ưu Form Handling

### ❌ Vấn đề hiện tại

- Form schema lặp lại
- Validation messages hardcode
- Form reset logic lặp lại

### ✅ Giải pháp

```tsx
// src/lib/validations/user.ts
import * as z from "zod";
import { VALIDATION } from "@/lib/constants";

export const userSchema = {
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH, `Mật khẩu tối thiểu ${VALIDATION.PASSWORD.MIN_LENGTH} ký tự`),
  role: z.enum(["user", "admin"]),
  isActive: z.boolean(),
};

export const createUserSchema = z.object({
  ...userSchema,
  password: userSchema.password,
});

export const updateUserSchema = z.object({
  ...userSchema,
  password: userSchema.password.optional(),
});
```

---

## 9. Tối ưu Error Handling

### ❌ Vấn đề hiện tại

- Try-catch lặp lại
- Error messages không consistent

### ✅ Giải pháp

```tsx
// src/lib/utils/error-handler.ts (có sẵn, nhưng có thể mở rộng)
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  onError?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const message = getErrorMessage(error);
    if (onError) {
      onError(error);
    } else {
      console.error("Error:", message);
    }
    return null;
  }
}

// Sử dụng
const result = await withErrorHandling(
  () => userService.updateUser(id, payload),
  (error) => showErrorToast(error, "Lỗi cập nhật")
);
```

---

## 10. Checklist Tối ưu

### 🔴 Ưu tiên cao (Làm ngay)

- [ ] **Tách `dashboard/users/page.tsx`** (903 dòng) thành components nhỏ:
  - [ ] `UserStats` component
  - [ ] `UserFilters` component
  - [ ] `UserTable` component
  - [ ] `UserEditDialog` component
  - [ ] `UserDeleteDialog` component
- [ ] **Thêm `useMemo`** cho filtered/sorted/paginated users
- [ ] **Thêm `useCallback`** cho event handlers
- [ ] **Tạo custom hooks**: `useUsers`, `useSearchFilter`, `usePagination`
- [ ] **Tạo utility functions**: `showSuccessToast`, `showErrorToast`
- [ ] **Thêm constants** cho magic values

### 🟡 Ưu tiên trung bình (Làm sau)

- [ ] **Tách các page khác** nếu > 300 dòng
- [ ] **Thêm `React.memo`** cho table rows, cards
- [ ] **Cải thiện type safety** (bỏ `any`, thêm types)
- [ ] **Tạo shared components**: `LoadingErrorState`, `EmptyState`
- [ ] **Tối ưu form schemas** (tách ra file riêng)

### 🟢 Ưu tiên thấp (Nice to have)

- [ ] **Cân nhắc React Query** nếu cần cache phức tạp
- [ ] **Code splitting** với dynamic imports
- [ ] **Lazy loading** cho heavy components
- [ ] **Virtual scrolling** cho table lớn (nếu > 1000 rows)

---

## 📊 Ước tính Impact

| Tối ưu | Impact | Effort | Priority |
|--------|--------|--------|----------|
| Tách components | ⭐⭐⭐⭐⭐ | Medium | High |
| Memoization | ⭐⭐⭐⭐ | Low | High |
| Custom hooks | ⭐⭐⭐⭐ | Medium | High |
| Reduce duplication | ⭐⭐⭐ | Low | Medium |
| Type safety | ⭐⭐⭐ | Low | Medium |
| Constants | ⭐⭐ | Low | Low |

---

## 🎯 Kết luận

**Bắt đầu với:**
1. Tách `dashboard/users/page.tsx` thành components nhỏ
2. Thêm memoization cho computed values
3. Tạo custom hooks cho logic tái sử dụng
4. Tạo utility functions cho toast/error handling

**Kết quả mong đợi:**
- Code dễ maintain hơn (components nhỏ, tách biệt)
- Performance tốt hơn (memoization, ít re-render)
- Dễ test hơn (logic tách riêng, hooks testable)
- Dễ reuse hơn (components, hooks, utilities)
