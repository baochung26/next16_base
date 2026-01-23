"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-muted-foreground mb-4">
            404
          </div>
          <CardTitle className="text-2xl">Trang không tồn tại</CardTitle>
          <CardDescription>
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link href={ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
