"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  isAdminUser,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/utils/auth";
import { clearTokens } from "@/lib/api/token";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();

  const handleSignOut = async () => {
    clearTokens();
    // Clear cookies
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "refreshToken=; path=/; max-age=0";
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const userIsAdmin = isAdminUser(user);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto relative flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Left side */}
        <div className="flex items-center flex-shrink-0 z-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              NextApp
            </span>
          </Link>
        </div>

        {/* Navigation - Center (hidden on mobile) */}
        <nav className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex items-center space-x-1 pointer-events-auto">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent"
            >
              Trang chủ
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent"
            >
              Giới thiệu
            </Link>
            <Link
              href="/features"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent"
            >
              Tính năng
            </Link>
          </div>
        </nav>

        {/* Right side - Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10">
          <ThemeToggle />
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
                {userIsAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center w-full cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="h-9">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild className="h-9">
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
