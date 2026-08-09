import React from "react";
import { TEMPLATES, useInsertTemplate } from "../../templates";

/** "Add → Layouts": drop-in pre-designed sections. */
export const TemplatesPanel = () => {
  const insert = useInsertTemplate();

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-4 border-b border-[#ECEEF2] sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-gray-900">Layouts</h2>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5">Drop in a ready-made section</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 pb-20 space-y-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => insert(t.build)}
              className="w-full flex items-center gap-3 p-3 border border-[#ECEEF2] rounded-lg hover:border-[#93B4FF] hover:bg-[#EFF4FF] text-left transition-colors group"
            >
              <span className="w-9 h-9 rounded-md bg-gray-100 group-hover:bg-white flex items-center justify-center text-[#6B7280] group-hover:text-[#2563EB] shrink-0">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-800">{t.label}</div>
                <div className="text-[10px] text-[#9CA3AF]">Click to insert</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
