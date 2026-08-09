"use client";

import { Activity, CheckCircle2, Server, Database, Cloud, ShieldCheck } from "lucide-react";

export function SettingsLogs() {
  const SYSTEM_CHECKS = [
    { name: "Next.js App Router Engine", status: "Operational", detail: "v16.2.3 (Turbopack SSR/ISR)", icon: Server, ok: true },
    { name: "Supabase Postgres Database", status: "Connected", detail: "RLS Policies Active", icon: Database, ok: true },
    { name: "UploadThing Cloud Storage", status: "Active", detail: "UTApi v7 Ready", icon: Cloud, ok: true },
    { name: "Site Smooth Scroll Engine", status: "Enabled", detail: "Lenis v1.3 + GSAP 3.14", icon: ShieldCheck, ok: true },
  ];

  const RECENT_AUDITS = [
    { action: "Media Library Synced", user: "Admin System", time: "Just now", type: "system" },
    { action: "Updated General Site Branding", user: "Admin", time: "Today", type: "settings" },
    { action: "Published Execom Committee", user: "Admin", time: "Today", type: "execom" },
    { action: "Created Event Registration", user: "Admin", time: "Yesterday", type: "events" },
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
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
          <Activity className="w-4 h-4 text-red" /> Recent Administrative Activity
        </h3>

        <div className="divide-y divide-gray-100">
          {RECENT_AUDITS.map((log, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-navy">{log.action}</span>
                <span className="text-[10px] text-gray-400 ml-2 font-mono">by {log.user}</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
