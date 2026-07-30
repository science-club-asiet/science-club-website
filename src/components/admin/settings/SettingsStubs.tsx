"use client";

import { Wrench } from "lucide-react";

export function SettingsStubs({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
        <Wrench className="w-8 h-8 text-gray-300" />
      </div>
      <h2 className="font-oswald text-2xl font-bold uppercase text-navy">{title}</h2>
      <p className="text-gray-500 mt-2 max-w-sm">
        {desc}
      </p>
      <span className="mt-6 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest rounded-full">
        Coming Soon
      </span>
    </div>
  );
}
