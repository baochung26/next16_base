import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
  className,
  variant = "rectangular",
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variantClasses[variant],
        className
      )}
    />
  );
}

// Pre-built skeleton components
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-6 w-1/3" variant="text" />
      <Skeleton className="h-4 w-full" variant="text" />
      <Skeleton className="h-4 w-2/3" variant="text" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        <Skeleton className="h-4 w-24" variant="text" />
        <Skeleton className="h-4 w-32" variant="text" />
        <Skeleton className="h-4 w-20" variant="text" />
        <Skeleton className="h-4 w-16" variant="text" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-10 w-10" variant="circular" />
          <Skeleton className="h-4 flex-1" variant="text" />
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-4 w-16" variant="text" />
        </div>
      ))}
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12" variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" variant="text" />
          <Skeleton className="h-3 w-24" variant="text" />
        </div>
      </div>
    </div>
  );
}
