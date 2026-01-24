import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
  // Client-side DashboardLayout will handle authentication and admin check

  const documents = [
    {
      id: "1",
      name: "Báo cáo tháng 1.pdf",
      type: "PDF",
      size: "2.5 MB",
      uploadedAt: "2024-01-23",
      uploadedBy: "Admin",
    },
    {
      id: "2",
      name: "Hướng dẫn sử dụng.docx",
      type: "DOCX",
      size: "1.2 MB",
      uploadedAt: "2024-01-22",
      uploadedBy: "Admin",
    },
    {
      id: "3",
      name: "Danh sách sản phẩm.xlsx",
      type: "XLSX",
      size: "856 KB",
      uploadedAt: "2024-01-21",
      uploadedBy: "User",
    },
    {
      id: "4",
      name: "Chính sách bảo mật.pdf",
      type: "PDF",
      size: "3.1 MB",
      uploadedAt: "2024-01-20",
      uploadedBy: "Admin",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Quản lý tài liệu
            </h2>
            <p className="text-muted-foreground">
              Quản lý và chia sẻ tài liệu trong hệ thống
            </p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Tải lên
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách tài liệu</CardTitle>
                <CardDescription>
                  Tất cả tài liệu đã được tải lên
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm..." className="pl-8 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadedAt}</span>
                        <span>•</span>
                        <span>{doc.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
