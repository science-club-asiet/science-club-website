"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminBackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function AdminBackButton({
  href,
  label = "Back",
  className,
}: AdminBackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-xs font-oswald uppercase tracking-widest text-navy/60 hover:text-red transition-colors py-1.5 px-3 mb-6 rounded-lg bg-gray-100/80 hover:bg-gray-200/80 border border-gray-200/60 group cursor-pointer w-fit",
        className
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-navy/60 group-hover:text-red" />
      <span>{label}</span>
    </Link>
  );
}
