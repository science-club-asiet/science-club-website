"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RESOURCE_LIST } from "@/lib/admin/resources";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();

  const item = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          active ? "bg-red text-white" : "text-navy/70 hover:bg-navy/5"
        )}
      >
        {label}
      </Link>
    );
  };

  const heading = (t: string) => (
    <p className="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t}</p>
  );

  return (
    <nav className="flex flex-col gap-0.5">
      {item("/admin", "Dashboard")}
      {heading("Content")}
      {RESOURCE_LIST.map((r) => item(`/admin/${r.key}`, r.label))}
      {item("/admin/forms", "Forms")}
      {heading("Site")}
      {item("/admin/site", "Site content")}
      {item("/admin/teams", "Teams")}
      {heading("People")}
      {item("/admin/applications", "Applications")}
      {item("/admin/members", "Members")}
    </nav>
  );
}
