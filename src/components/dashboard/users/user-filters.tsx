"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FILTER_VALUES, SORT_ORDER, USER_ROLES } from "@/lib/constants";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: "user" | "admin" | "all";
  onRoleFilterChange: (value: "user" | "admin" | "all") => void;
  isActiveFilter: "all" | "true" | "false";
  onIsActiveFilterChange: (value: "all" | "true" | "false") => void;
  sortBy: "createdAt" | "updatedAt" | "email" | "firstName" | "lastName" | "role" | "isActive";
  onSortByChange: (value: "createdAt" | "updatedAt" | "email" | "firstName" | "lastName" | "role" | "isActive") => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (value: "ASC" | "DESC") => void;
  onFilterChange: () => void;
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onFilterChange,
}: UserFiltersProps) {
  const handleRoleChange = (value: string) => {
    onRoleFilterChange(value as "user" | "admin" | "all");
    onFilterChange();
  };

  const handleIsActiveChange = (value: string) => {
    onIsActiveFilterChange(value as "all" | "true" | "false");
    onFilterChange();
  };

  const handleSortByChange = (value: string) => {
    onSortByChange(value as typeof sortBy);
    onFilterChange();
  };

  const handleSortOrderChange = (value: string) => {
    onSortOrderChange(value as "ASC" | "DESC");
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
      <select
        value={roleFilter}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value={FILTER_VALUES.ALL}>Tất cả vai trò</option>
        <option value={USER_ROLES.USER}>User</option>
        <option value={USER_ROLES.ADMIN}>Admin</option>
      </select>
      <select
        value={isActiveFilter}
        onChange={(e) => handleIsActiveChange(e.target.value)}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value={FILTER_VALUES.ALL}>Tất cả trạng thái</option>
        <option value={FILTER_VALUES.TRUE}>Hoạt động</option>
        <option value={FILTER_VALUES.FALSE}>Không hoạt động</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value)}
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
        onChange={(e) => handleSortOrderChange(e.target.value)}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value={SORT_ORDER.DESC}>Giảm dần</option>
        <option value={SORT_ORDER.ASC}>Tăng dần</option>
      </select>
    </div>
  );
}
