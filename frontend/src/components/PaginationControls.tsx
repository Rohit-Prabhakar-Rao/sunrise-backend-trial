import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: PaginationControlsProps) => {

  // Logic to determine which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    // Always show first page, last page, and neighbor pages
    const startPage = 0;
    const endPage = totalPages - 1;

    // Calculate start and end of the "window" around current page
    let windowStart = Math.max(0, currentPage - 1);
    let windowEnd = Math.min(totalPages - 1, currentPage + 1);

    // Adjust window if close to boundaries to keep constant number of buttons
    if (currentPage <= 1) {
      windowEnd = Math.min(totalPages - 1, 2); // Show 1, 2, 3...
    } else if (currentPage >= totalPages - 2) {
      windowStart = Math.max(0, totalPages - 3); // ... 98, 99, 100
    }

    // Add First Page?
    if (windowStart > 0) {
      pages.push(0);
      if (windowStart > 1) pages.push(-1); // -1 represents "..."
    }

    // Add Window Pages
    for (let i = windowStart; i <= windowEnd; i++) {
      pages.push(i);
    }

    // Add Last Page?
    if (windowEnd < totalPages - 1) {
      if (windowEnd < totalPages - 2) pages.push(-1); // "..."
      pages.push(totalPages - 1);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4 border-t bg-background">
      {/* Mobile/Small Text Info */}
      <div className="text-sm text-muted-foreground text-center sm:text-left">
        Showing Page <span className="font-medium text-foreground">{currentPage + 1}</span> of{" "}
        <span className="font-medium text-foreground">{Math.max(1, totalPages)}</span>
      </div>

      <div className="flex items-center justify-center space-x-2">
        {/* PREVIOUS Button */}
        <Button
          variant="outline"
          size="icon" // changed to icon size for cleaner look
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        {/* PAGE NUMBERS */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((p, index) => {
            if (p === -1) {
              return (
                <div key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-8">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            return (
              <Button
                key={p}
                variant={currentPage === p ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${currentPage === p ? 'pointer-events-none' : ''}`}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
              >
                {p + 1}
              </Button>
            );
          })}
        </div>

        {/* NEXT Button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
};