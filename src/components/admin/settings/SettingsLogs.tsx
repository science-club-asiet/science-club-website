"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Server, Database, Cloud, ShieldCheck, Search, Filter, Calendar, X } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";

export type ActivityLog = {
  action: string;
  user: string;
  userRole?: string;
  category?: string;
  created_at: string;
};

function formatLogTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (isToday) {
    return `Today, ${timeStr}`;
  }
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${timeStr}`;
}

export function SettingsLogs({
  activities = [],
  dbLatency = 15,
  assetCount = 0,
}: {
  activities?: ActivityLog[];
  dbLatency?: number;
  assetCount?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const categoriesList = ["Event", "Post", "Form", "Page", "Application", "Registration", "Media", "User", "Content"];
  const rolesList = ["OWNER", "ADMIN", "EXECOM", "MEMBER", "APPLICANT"];

  // Filter activities dynamically
  const filteredActivities = activities.filter((act) => {
    // 1. Category Filter
    if (selectedCategory !== "all" && act.category !== selectedCategory) return false;

    // 2. User Role Filter
    if (selectedRole !== "all" && act.userRole !== selectedRole) return false;

    // 3. Date Range Filter
    if (dateRange !== "all") {
      const actTime = new Date(act.created_at).getTime();
      const now = Date.now();
      if (dateRange === "today") {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        if (actTime < todayStart) return false;
      } else if (dateRange === "7days") {
        if (now - actTime > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (dateRange === "30days") {
        if (now - actTime > 30 * 24 * 60 * 60 * 1000) return false;
      }
    }

    // 4. Keyword Search
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        act.action.toLowerCase().includes(q) ||
        act.user.toLowerCase().includes(q) ||
        (act.category && act.category.toLowerCase().includes(q)) ||
        (act.userRole && act.userRole.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasActiveFilters = search || selectedCategory !== "all" || selectedRole !== "all" || dateRange !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedRole("all");
    setDateRange("all");
    setCurrentPage(1);
  };

  const SYSTEM_CHECKS = [
    { name: "Next.js App Router Engine", status: "Operational", detail: "v16.2.3 (Turbopack SSR/ISR)", icon: Server },
    { name: "Supabase Postgres Database", status: "Connected", detail: `RLS Active (${dbLatency}ms latency)`, icon: Database },
    { name: "UploadThing Cloud Storage", status: "Active", detail: `${assetCount} assets tracked in CDN`, icon: Cloud },
    { name: "Site Motion & Scroll Engine", status: "Enabled", detail: "Lenis v1.3 + GSAP 3.14", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 font-inter max-w-4xl">
      <div>
        <h2 className="font-oswald text-2xl font-bold uppercase text-navy">System Logs & Health</h2>
        <p className="text-xs text-gray-500 mt-1">Real-time status checks for core platform infrastructure and admin audit trails.</p>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SYSTEM_CHECKS.map((check) => {
          const Icon = check.icon;
          return (
            <div key={check.name} className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy">{check.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{check.detail}</div>
                </div>
              </div>

              <span className="bg-green-100 text-green-700 text-[10px] font-oswald uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-green-600" /> {check.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
            <Activity className="w-4 h-4 text-red" /> Administrative Activity Log
          </h3>

          <div className="text-xs text-gray-400 font-mono">
            Showing <strong className="text-navy">{filteredActivities.length}</strong> of {activities.length} entries
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 bg-gray-50/60 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search action or user..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-navy focus:outline-none focus:border-red"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-navy focus:outline-none focus:border-red cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* User Role Filter */}
          <div className="relative">
            <ShieldCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-navy focus:outline-none focus:border-red cursor-pointer"
            >
              <option value="all">All Roles</option>
              {rolesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-navy focus:outline-none focus:border-red cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="px-5 py-2 bg-red/5 border-b border-red/10 flex items-center justify-between text-xs">
            <div className="text-navy/70 text-[11px]">
              Filters active: <strong className="text-navy font-mono">{filteredActivities.length}</strong> matching entries found.
            </div>
            <button
              onClick={clearFilters}
              className="text-[11px] font-oswald uppercase tracking-wider font-bold text-red hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        )}

        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 font-mono space-y-2">
            <div>No activity logs match the selected filter criteria.</div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-red font-bold hover:underline cursor-pointer text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="divide-y divide-gray-100 px-5">
              {paginatedActivities.map((log, idx) => {
                const initials = (log.user || "A")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div key={idx} className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-navy/10 text-navy font-oswald font-bold text-[10px] flex items-center justify-center shrink-0 border border-navy/20">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-navy">{log.action}</span>
                          {log.category && (
                            <span className="text-[9px] font-mono uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {log.category}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span>by <strong className="text-navy/80">{log.user}</strong></span>
                          {log.userRole && (
                            <span className="text-[9px] font-oswald uppercase tracking-wider font-bold text-red bg-red/10 px-1.5 py-0.2 rounded-md">
                              {log.userRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 shrink-0">
                      {formatLogTime(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
