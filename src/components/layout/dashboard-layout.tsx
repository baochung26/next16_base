"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Menu,
  X,
  BarChart3,
  FileText,
  ArrowLeft,
  LogOut,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearTokens, clearAuthCookies } from "@/lib/api/token";
import {
  getUserDisplayName,
  getUserInitials,
  isAdminUser,
} from "@/lib/utils/auth";
import { useAuth } from "@/contexts/auth-context";

const menuItems = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Sản phẩm",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Đơn hàng",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Báo cáo",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Tài liệu",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, setUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        const userIsAdmin = isAdminUser(user);
        // Debug: log user info to check role
        if (process.env.NODE_ENV === "development") {
          console.log("Dashboard access check:", {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            isAdmin: userIsAdmin,
          });
        }
        if (!userIsAdmin) {
          router.push("/");
        }
      }
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    clearTokens();
    clearAuthCookies();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const displayName = user
    ? getUserDisplayName(
        user.name,
        user.email,
        user.firstName,
        user.lastName
      )
    : "";

  const userInitials = user
    ? getUserInitials(user.name, user.email, user.firstName, user.lastName)
    : "";

  // Show loading or redirect if not admin
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser(user)) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="border-t p-3 space-y-1">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Về trang chủ
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {menuItems.find((item) => item.href === pathname)?.title ||
                "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
            {loading ? (
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2 sm:px-3 hover:bg-accent"
                  >
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-medium flex-shrink-0">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt={displayName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium leading-tight truncate max-w-[120px]">
                        {displayName}
                      </span>
                      {user.email && (
                        <span className="text-xs text-muted-foreground leading-tight truncate max-w-[120px]">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center w-full cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
