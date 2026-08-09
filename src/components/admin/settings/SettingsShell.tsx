"use client";

import { useState } from "react";
import { SettingsGeneral } from "./SettingsGeneral";
import { SettingsUsers, type UserProfile } from "./SettingsUsers";
import { SettingsStorage, type StorageAsset } from "./SettingsStorage";
import { SettingsLogs } from "./SettingsLogs";
import { SettingsEmail } from "./SettingsEmail";
import { LayoutDashboard, Users, Mail, HardDrive, ScrollText } from "lucide-react";

export function SettingsShell({
  initialSettings,
  profiles = [],
  mediaAssets = [],
}: {
  initialSettings: Record<string, unknown>;
  profiles?: UserProfile[];
  mediaAssets?: StorageAsset[];
}) {
  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "General", icon: LayoutDashboard },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "storage", label: "Storage & Cloud", icon: HardDrive },
    { id: "logs", label: "Logs & Health", icon: ScrollText },
    { id: "email", label: "Email Status", icon: Mail },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start font-inter">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
        <h1 className="font-oswald text-3xl font-bold uppercase mb-4 pl-3 text-navy">Settings</h1>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-oswald uppercase tracking-wider transition-all cursor-pointer ${
                active ? "bg-navy text-white font-bold shadow-md" : "text-navy/70 hover:bg-gray-100 hover:text-navy font-medium"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-red" : "text-navy/50"}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 w-full bg-white border border-gray-200/80 rounded-2xl p-6 min-h-[550px] shadow-sm">
        {tab === "general" && <SettingsGeneral settings={initialSettings} />}
        {tab === "users" && <SettingsUsers profiles={profiles} />}
        {tab === "storage" && <SettingsStorage assets={mediaAssets} />}
        {tab === "logs" && <SettingsLogs />}
        {tab === "email" && <SettingsEmail />}
      </div>
    </div>
  );
}
