import React, { useMemo, useState } from "react";
import { useEditor, Element } from "@craftjs/core";
import { Search } from "lucide-react";
import { toolboxGroups, resolver } from "../../registry";
import type { RegistryEntry } from "../../registry";

const DraggableItem = ({ entry }: { entry: RegistryEntry }) => {
  const { connectors: { create } } = useEditor();
  const Comp = resolver[entry.type];
  const Icon = entry.icon;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (!ref || !Comp) return;
        // Layout blocks are created as *canvas* nodes so things can be dropped
        // inside them (the core of the nesting model).
        create(
          ref,
          entry.isCanvas
            ? React.createElement(Element as React.ComponentType<{ canvas?: boolean; is?: React.ComponentType<Record<string, unknown>> }>, { canvas: true, is: Comp })
            : React.createElement(Comp)
        );
      }}
      className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing text-gray-500 hover:text-blue-600 transition-all bg-white shadow-sm"
    >
      <Icon size={24} strokeWidth={1.5} className="mb-2" />
      <span className="text-[10px] font-medium tracking-wide text-center leading-tight">{entry.label}</span>
    </div>
  );
};

export const SidebarLeft = () => {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toolboxGroups;
    return toolboxGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header & Search */}
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Add Elements</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search elements..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Element Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-3">
              {group.label}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {group.items.map((entry) => (
                <DraggableItem key={entry.type} entry={entry} />
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="text-xs text-gray-400 text-center pt-4">No elements match “{query}”.</p>
        )}
      </div>
    </div>
  );
};
