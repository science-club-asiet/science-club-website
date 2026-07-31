import React from "react";
import { TEMPLATES, useInsertTemplate } from "../../templates";

/** "Add → Layouts": drop-in pre-designed sections. */
export const TemplatesPanel = () => {
  const insert = useInsertTemplate();

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-gray-900">Layouts</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Drop in a ready-made section</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 pb-20 space-y-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => insert(t.build)}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors group"
            >
              <span className="w-9 h-9 rounded-md bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-500 group-hover:text-blue-600 shrink-0">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-800">{t.label}</div>
                <div className="text-[10px] text-gray-400">Click to insert</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
