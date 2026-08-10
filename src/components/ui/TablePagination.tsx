"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
}

const DotsInput = ({ onJump, totalPages }: { onJump: (p: number) => void; totalPages: number }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let p = parseInt(val, 10);
    if (isNaN(p)) {
      setIsEditing(false);
      return;
    }
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    onJump(p);
    setIsEditing(false);
    setVal("");
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="inline-flex items-center mx-0.5">
        <input
          type="number"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => handleSubmit()}
          placeholder="#"
          className="w-10 h-7 text-center text-xs font-mono font-bold rounded-lg border border-red bg-white text-navy focus:outline-none focus:ring-1 focus:ring-red shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="px-2 text-navy/40 hover:text-red hover:bg-red/5 h-7 rounded-lg transition-colors cursor-pointer font-bold text-xs"
      title="Click to jump to page..."
    >
      ...
    </button>
  );
};

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}: TablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-gray-50/80 rounded-b-2xl border-t border-gray-100 font-inter text-xs text-navy", className)}>
      <div className="text-navy/70 font-medium">
        Showing <span className="font-bold font-mono text-navy">{startItem}</span> to{" "}
        <span className="font-bold font-mono text-navy">{endItem}</span> of{" "}
        <span className="font-bold font-mono text-navy">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Items per page selector */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-navy/60 font-medium text-[11px] uppercase tracking-wider font-oswald">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-navy focus:outline-none focus:border-red cursor-pointer"
            >
              {[5, 10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-navy/60 hover:text-navy hover:bg-gray-200/80 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <DotsInput onJump={onPageChange} totalPages={totalPages} />
                ) : (
                  <button
                    type="button"
                    onClick={() => onPageChange(page as number)}
                    className={cn(
                      "h-7 min-w-[28px] px-2 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer",
                      page === currentPage
                        ? "bg-navy text-white border-navy shadow-xs"
                        : "text-navy/70 border-transparent hover:text-navy hover:bg-gray-200/80"
                    )}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-navy/60 hover:text-navy hover:bg-gray-200/80 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
