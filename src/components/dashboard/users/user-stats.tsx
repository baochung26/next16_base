"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const activePercentage =
    users.length > 0
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">
            {activePercentage}% trong danh sách
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveCount}</div>
          <p className="text-xs text-muted-foreground">Trong danh sách</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminCount}</div>
          <p className="text-xs text-muted-foreground">Trong danh sách</p>
        </CardContent>
      </Card>
    </div>
  );
}
