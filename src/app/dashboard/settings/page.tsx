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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Globe, Save } from "lucide-react";

export default async function SettingsPage() {
  let user;
  try {
    user = await requireServerAdmin();
  } catch (error) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cài đặt</h2>
          <p className="text-muted-foreground">
            Quản lý cài đặt hệ thống và tài khoản
          </p>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Cài đặt chung</CardTitle>
              </div>
              <CardDescription>
                Cấu hình các thiết lập chung của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Tên website</Label>
                <Input id="site-name" defaultValue="NextApp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-url">URL website</Label>
                <Input id="site-url" defaultValue="https://example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Múi giờ</Label>
                <Input id="timezone" defaultValue="Asia/Ho_Chi_Minh" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Thông báo</CardTitle>
              </div>
              <CardDescription>
                Cấu hình các thông báo hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email thông báo</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo qua email
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Thông báo đơn hàng mới</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo khi có đơn hàng mới
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Thông báo người dùng mới</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo khi có người dùng mới đăng ký
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Bảo mật</CardTitle>
              </div>
              <CardDescription>
                Cài đặt bảo mật và quyền truy cập
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Thời gian hết phiên (phút)</Label>
                <Input id="session-timeout" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Yêu cầu xác thực 2 bước</Label>
                  <p className="text-sm text-muted-foreground">
                    Bật xác thực 2 bước cho tất cả người dùng
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ghi log hoạt động</Label>
                  <p className="text-sm text-muted-foreground">
                    Ghi lại tất cả hoạt động của người dùng
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Ngôn ngữ và khu vực</CardTitle>
              </div>
              <CardDescription>
                Cấu hình ngôn ngữ và định dạng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Input id="language" defaultValue="Tiếng Việt" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Tiền tệ</Label>
                <Input id="currency" defaultValue="VND (₫)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Định dạng ngày</Label>
                <Input id="date-format" defaultValue="DD/MM/YYYY" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
