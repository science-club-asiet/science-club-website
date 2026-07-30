"use client";

import { useState } from "react";
import { SettingsGeneral } from "./SettingsGeneral";
import { SettingsStubs } from "./SettingsStubs";
import { LayoutDashboard, Users, Mail, HardDrive, ScrollText } from "lucide-react";

export function SettingsShell({
  initialSettings,
}: {
  initialSettings: Record<string, unknown>;
}) {
  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "General", icon: LayoutDashboard },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "email", label: "Email", icon: Mail },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "logs", label: "Logs", icon: ScrollText },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
        <h1 className="font-oswald text-3xl font-bold uppercase mb-4 pl-3">Settings</h1>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-navy text-white font-medium shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-6 min-h-[500px] shadow-sm">
        {tab === "general" && <SettingsGeneral settings={initialSettings} />}
        {tab === "users" && <SettingsStubs title="Users & Roles" desc="Manage admin roles and global site access." />}
        {tab === "email" && <SettingsStubs title="Email Settings" desc="Configure SMTP provider for transactional emails." />}
        {tab === "storage" && <SettingsStubs title="Storage" desc="Manage S3 buckets and asset limits." />}
        {tab === "logs" && <SettingsStubs title="System Logs" desc="View audit trails and background job errors." />}
      </div>
    </div>
  );
}
