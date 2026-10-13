import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
}

const getVisiblePages = (
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): Array<number | "ellipsis"> => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const sideCount = Math.floor((maxVisible - 2) / 2);
  let start = Math.max(2, currentPage - sideCount);
  let end = Math.min(totalPages - 1, currentPage + sideCount);
  const windowSize = maxVisible - 2;

  if (end - start + 1 < windowSize) {
    if (start === 2) {
      end = Math.min(totalPages - 1, start + windowSize - 1);
    } else {
      start = Math.max(2, end - windowSize + 1);
    }
  }

  const pages: Array<number | "ellipsis"> = [1];
  if (start > 2) {
    pages.push("ellipsis");
  }
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }
  pages.push(totalPages);

  return pages;
};

function NavButton({
  onClick,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 items-center gap-1 rounded-md bg-midnight-800 px-3 text-sm font-bold text-white transition hover:bg-midnight-700 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function SharedPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  previousLabel = "Prev",
  nextLabel = "Next",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const goToPage = (page: number) => {
    if (
      onPageChange &&
      page >= 1 &&
      page <= totalPages &&
      page !== normalizedCurrentPage
    ) {
      onPageChange(page);
    }
  };

  const mobilePages = getVisiblePages(normalizedCurrentPage, totalPages, 3);
  const tabletPages = getVisiblePages(normalizedCurrentPage, totalPages, 5);
  const desktopPages = getVisiblePages(normalizedCurrentPage, totalPages, 7);

  const renderPages = (
    pages: Array<number | "ellipsis">,
    keyPrefix: string,
    extraClass: string,
  ) => (
    <div className={cn("flex items-center gap-1", extraClass)}>
      {pages.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={`${keyPrefix}-${page}`}
            type="button"
            onClick={() => goToPage(page)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold transition-colors",
              page === normalizedCurrentPage
                ? "bg-midnight-500 text-white"
                : "bg-midnight-800 text-white hover:bg-midnight-700",
            )}
          >
            {page}
          </button>
        ) : (
          <span
            key={`${keyPrefix}-ellipsis-${index}`}
            className="flex h-10 w-7 items-center justify-center text-steel-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ),
      )}
    </div>
  );

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-2"
    >
      <NavButton
        label={previousLabel}
        onClick={() => goToPage(normalizedCurrentPage - 1)}
        disabled={normalizedCurrentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{previousLabel}</span>
      </NavButton>

      {renderPages(mobilePages, "mobile", "sm:hidden")}
      {renderPages(tabletPages, "tablet", "hidden sm:flex lg:hidden")}
      {renderPages(desktopPages, "desktop", "hidden lg:flex")}

      <NavButton
        label={nextLabel}
        onClick={() => goToPage(normalizedCurrentPage + 1)}
        disabled={normalizedCurrentPage === totalPages}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRight className="h-4 w-4" />
      </NavButton>
    </nav>
  );
}
