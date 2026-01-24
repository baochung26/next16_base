import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardWelcome } from "./dashboard-welcome";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  // Client-side DashboardLayout will handle authentication and admin check
  // No need to check user here as DashboardLayout will redirect if not admin

  const stats = [
    {
      title: "Tổng người dùng",
      value: "12,345",
      change: "+20.1%",
      trend: "up",
      icon: Users,
      description: "so với tháng trước",
    },
    {
      title: "Sản phẩm",
      value: "8,234",
      change: "+12.5%",
      trend: "up",
      icon: Package,
      description: "so với tháng trước",
    },
    {
      title: "Đơn hàng",
      value: "5,678",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      description: "so với tháng trước",
    },
    {
      title: "Doanh thu",
      value: "$124,567",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      description: "so với tháng trước",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Người dùng mới đăng ký",
      user: "user@example.com",
      time: "5 phút trước",
    },
    {
      id: 2,
      action: "Đơn hàng mới",
      user: "Order #1234",
      time: "15 phút trước",
    },
    {
      id: 3,
      action: "Sản phẩm được cập nhật",
      user: "Product #567",
      time: "30 phút trước",
    },
    {
      id: 4,
      action: "Người dùng mới đăng ký",
      user: "user2@example.com",
      time: "1 giờ trước",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <DashboardWelcome />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>
                    <span> {stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Activities */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Activity Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các hoạt động mới nhất trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Thống kê nhanh</CardTitle>
              <CardDescription>Tổng quan hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Hoạt động hôm nay</span>
                </div>
                <span className="text-sm font-semibold">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tăng trưởng</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  +15.2%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Người dùng online</span>
                </div>
                <span className="text-sm font-semibold">456</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Đơn hàng hôm nay</span>
                </div>
                <span className="text-sm font-semibold">89</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
