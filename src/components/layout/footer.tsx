import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">NextApp</h3>
            <p className="text-sm text-muted-foreground">
              Ứng dụng Next.js hiện đại với authentication và UI components đẹp
              mắt.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tính năng
                </Link>
              </li>
            </ul>
          </div>

          {/* Auth Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Tài khoản</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/auth/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Tài nguyên</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Next.js Docs
                </a>
              </li>
              <li>
                <a
                  href="https://ui.shadcn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  shadcn/ui
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NextApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
