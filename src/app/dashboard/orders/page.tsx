import { redirect } from "next/navigation";
import { requireServerAdmin } from "@/lib/api/server-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default async function OrdersPage() {
  let user;
  try {
    user = await requireServerAdmin();
  } catch (error) {
    redirect("/auth/login");
  }

  const orders = [
    {
      id: "ORD-001",
      customer: "Nguyễn Văn A",
      product: "Sản phẩm A",
      amount: 1290000,
      status: "Completed",
      date: "2024-01-23",
    },
    {
      id: "ORD-002",
      customer: "Trần Thị B",
      product: "Sản phẩm B",
      amount: 599000,
      status: "Pending",
      date: "2024-01-23",
    },
    {
      id: "ORD-003",
      customer: "Lê Văn C",
      product: "Sản phẩm C",
      amount: 299000,
      status: "Processing",
      date: "2024-01-22",
    },
    {
      id: "ORD-004",
      customer: "Phạm Thị D",
      product: "Sản phẩm D",
      amount: 2490000,
      status: "Cancelled",
      date: "2024-01-21",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "Processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý đơn hàng
          </h2>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tất cả đơn hàng
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng đơn hàng
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +15 từ tháng trước
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                Đơn hàng chờ xử lý
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,089</div>
              <p className="text-xs text-muted-foreground">88% tổng số</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">8% tổng số</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <CardDescription>
                  Tất cả đơn hàng trong hệ thống
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="h-9 rounded-md border border-input bg-background px-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium">
                      Mã đơn
                    </th>
                    <th className="text-left p-4 text-sm font-medium">
                      Khách hàng
                    </th>
                    <th className="text-left p-4 text-sm font-medium">
                      Sản phẩm
                    </th>
                    <th className="text-left p-4 text-sm font-medium">
                      Số tiền
                    </th>
                    <th className="text-left p-4 text-sm font-medium">
                      Trạng thái
                    </th>
                    <th className="text-left p-4 text-sm font-medium">Ngày</th>
                    <th className="text-right p-4 text-sm font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{order.id}</td>
                      <td className="p-4">{order.customer}</td>
                      <td className="p-4">{order.product}</td>
                      <td className="p-4 font-semibold">
                        {order.amount.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {order.date}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
