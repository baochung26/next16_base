import { Loading } from "@/components/loading";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Đang tải..." />
    </div>
  );
}
