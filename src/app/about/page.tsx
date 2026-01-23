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
  Target,
  Users,
  Zap,
  Shield,
  Code,
  Heart,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Globe,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Mục tiêu",
      description:
        "Tạo ra những sản phẩm công nghệ chất lượng cao, đáp ứng nhu cầu thực tế của người dùng.",
    },
    {
      icon: Users,
      title: "Cộng đồng",
      description:
        "Xây dựng một cộng đồng phát triển mạnh mẽ, chia sẻ kiến thức và hỗ trợ lẫn nhau.",
    },
    {
      icon: Zap,
      title: "Đổi mới",
      description:
        "Luôn tìm kiếm và áp dụng những công nghệ mới nhất để cải thiện trải nghiệm người dùng.",
    },
    {
      icon: Shield,
      title: "Bảo mật",
      description:
        "Đặt bảo mật và quyền riêng tư của người dùng lên hàng đầu trong mọi quyết định.",
    },
  ];

  const team = [
    {
      name: "Development Team",
      role: "Full-stack Developers",
      description: "Xây dựng và phát triển sản phẩm",
    },
    {
      name: "Design Team",
      role: "UI/UX Designers",
      description: "Thiết kế giao diện và trải nghiệm người dùng",
    },
    {
      name: "QA Team",
      role: "Quality Assurance",
      description: "Đảm bảo chất lượng và hiệu suất",
    },
  ];

  const stats = [
    { label: "Người dùng", value: "10K+", icon: Users },
    { label: "Dự án", value: "500+", icon: Rocket },
    { label: "Quốc gia", value: "50+", icon: Globe },
    { label: "Đánh giá", value: "4.9/5", icon: Heart },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Về chúng tôi
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Chúng tôi là một đội ngũ đam mê công nghệ, luôn nỗ lực tạo ra
              những sản phẩm phần mềm chất lượng cao và trải nghiệm người dùng
              tuyệt vời.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/features">
                  Khám phá tính năng
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/register">Bắt đầu ngay</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                      {stat.value}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {stat.label}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-lg text-muted-foreground">
              Chúng tôi cam kết mang đến những giải pháp công nghệ hiện đại, dễ
              sử dụng và đáng tin cậy cho mọi người.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 sm:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-lg text-muted-foreground">
              Một đội ngũ tài năng và đam mê, làm việc cùng nhau để tạo ra những
              sản phẩm tuyệt vời.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {team.map((member) => (
              <Card key={member.name}>
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <CardDescription className="text-center">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Công nghệ chúng tôi sử dụng
            </h2>
            <p className="text-lg text-muted-foreground">
              Chúng tôi sử dụng những công nghệ hiện đại nhất để xây dựng sản
              phẩm.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Next.js 16",
                description:
                  "React framework với App Router và Server Components",
                icon: Code,
              },
              {
                name: "TypeScript",
                description: "Type-safe JavaScript cho code quality tốt hơn",
                icon: Shield,
              },
              {
                name: "Tailwind CSS",
                description:
                  "Utility-first CSS framework cho styling nhanh chóng",
                icon: Zap,
              },
              {
                name: "shadcn/ui",
                description: "Beautiful và accessible UI components",
                icon: Rocket,
              },
              {
                name: "NextAuth.js",
                description: "Authentication solution cho Next.js",
                icon: Shield,
              },
              {
                name: "Axios",
                description: "HTTP client cho API calls",
                icon: Globe,
              },
            ].map((tech) => {
              const Icon = tech.icon;
              return (
                <Card key={tech.name}>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{tech.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tech.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Sẵn sàng bắt đầu hành trình của bạn?
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Tham gia cùng chúng tôi ngay hôm nay
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Tạo tài khoản miễn phí và trải nghiệm tất cả các tính năng tuyệt
              vời của chúng tôi.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Đăng ký miễn phí
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Xem tính năng</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
