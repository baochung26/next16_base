import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Shield,
  Zap,
  Users,
  BarChart3,
  Lock,
  Smartphone,
  Globe,
  Code,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Settings,
  Database,
  Bell,
  Palette,
} from "lucide-react";

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Shield,
      title: "Xác thực an toàn",
      description:
        "Hệ thống xác thực hoàn chỉnh với JWT token, hỗ trợ đăng nhập bằng email hoặc username. Sẵn sàng tích hợp với NestJS backend.",
      features: [
        "Đăng nhập/Đăng ký",
        "Quên mật khẩu",
        "Reset mật khẩu",
        "JWT Token-based auth",
      ],
    },
    {
      icon: Zap,
      title: "UI Components đẹp mắt",
      description:
        "Thư viện components từ shadcn/ui, dễ dàng tùy chỉnh và tích hợp với Tailwind CSS. Hỗ trợ dark mode.",
      features: [
        "Accessible components",
        "Customizable",
        "Dark mode support",
        "Responsive design",
      ],
    },
    {
      icon: Database,
      title: "API Integration",
      description:
        "Cấu trúc API client chuẩn với Axios, sẵn sàng tích hợp với backend NestJS hoặc bất kỳ REST API nào.",
      features: [
        "Type-safe API calls",
        "Error handling",
        "Auto token management",
        "Request/Response interceptors",
      ],
    },
    {
      icon: BarChart3,
      title: "Dashboard quản trị",
      description:
        "Dashboard đầy đủ tính năng với sidebar navigation, quản lý users, products, orders và nhiều hơn nữa.",
      features: [
        "User management",
        "Data visualization",
        "Reports & Analytics",
        "Settings management",
      ],
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description:
        "Giao diện hoàn toàn responsive, hoạt động mượt mà trên mọi thiết bị từ mobile đến desktop.",
      features: [
        "Mobile-first approach",
        "Tablet optimized",
        "Desktop experience",
        "Touch-friendly",
      ],
    },
    {
      icon: Palette,
      title: "Theme System",
      description:
        "Hệ thống theme linh hoạt với hỗ trợ light/dark mode và system preference. Dễ dàng tùy chỉnh màu sắc.",
      features: [
        "Light/Dark mode",
        "System preference",
        "Smooth transitions",
        "Customizable colors",
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: Lock,
      title: "Bảo mật cao",
      description: "Mã hóa dữ liệu, HTTPS, và các biện pháp bảo mật hiện đại",
    },
    {
      icon: Bell,
      title: "Thông báo real-time",
      description: "Toast notifications với màu sắc rõ ràng và animations mượt mà",
    },
    {
      icon: Settings,
      title: "Dễ cấu hình",
      description: "Cấu hình linh hoạt với environment variables và settings",
    },
    {
      icon: Code,
      title: "TypeScript",
      description: "100% TypeScript cho type safety và developer experience tốt hơn",
    },
    {
      icon: Globe,
      title: "Đa ngôn ngữ",
      description: "Sẵn sàng hỗ trợ đa ngôn ngữ với i18n",
    },
    {
      icon: Sparkles,
      title: "Performance",
      description: "Tối ưu hiệu suất với Next.js 16 và React 19",
    },
  ];

  const benefits = [
    "Tiết kiệm thời gian phát triển",
    "Code quality cao với TypeScript",
    "Dễ dàng mở rộng và bảo trì",
    "Documentation đầy đủ",
    "Best practices được áp dụng",
    "Community support mạnh mẽ",
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Tính năng nổi bật
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tất cả những gì bạn cần
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Khám phá các tính năng mạnh mẽ giúp bạn xây dựng ứng dụng hiện
              đại và chuyên nghiệp.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Tìm hiểu thêm</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Tính năng chính
            </h2>
            <p className="text-lg text-muted-foreground">
              Những tính năng cốt lõi giúp bạn phát triển ứng dụng nhanh chóng
              và hiệu quả
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="flex flex-col">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 sm:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Tính năng bổ sung
            </h2>
            <p className="text-lg text-muted-foreground">
              Nhiều tính năng hữu ích khác để nâng cao trải nghiệm phát triển
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Lợi ích khi sử dụng
              </h2>
              <p className="text-lg text-muted-foreground">
                Tại sao bạn nên chọn chúng tôi?
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-base font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 sm:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Công nghệ hiện đại
            </h2>
            <p className="text-lg text-muted-foreground">
              Được xây dựng với những công nghệ tốt nhất hiện nay
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS v4",
              "shadcn/ui",
              "NextAuth.js",
              "Axios",
              "Zod",
            ].map((tech) => (
              <Card key={tech} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{tech}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Tạo tài khoản miễn phí và trải nghiệm tất cả các tính năng tuyệt
              vời ngay hôm nay.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Đăng ký miễn phí
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
