"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  onPageChange: (page: number) => void;
}

export function UserPagination({
  currentPage,
  totalPages,
  paginationMeta,
  onPageChange,
}: UserPaginationProps) {
  if (!paginationMeta || paginationMeta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="border-t px-6 py-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (
              page === currentPage - 2 ||
              page === currentPage + 2
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return null;
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Hiển thị {(paginationMeta.page - 1) * paginationMeta.limit + 1}-
        {Math.min(
          paginationMeta.page * paginationMeta.limit,
          paginationMeta.total
        )}{" "}
        trong tổng số {paginationMeta.total} người dùng
      </div>
    </div>
  );
}
