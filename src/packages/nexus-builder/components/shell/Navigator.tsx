import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { ChevronRight, ChevronDown, Eye, EyeOff, Trash2, Box } from "lucide-react";

const LayerRow = ({ id, depth }: { id: string; depth: number }) => {
  const [open, setOpen] = useState(true);

  const { actions, name, children, hidden, isSelected, isHovered, isDeletable } =
    useEditor((state, query) => {
      const node = state.nodes[id];
      return {
        name: node?.data.custom?.displayName || node?.data.displayName || "Node",
        children: node?.data.nodes ?? [],
        hidden: node?.data.hidden ?? false,
        isSelected: state.events.selected.has(id),
        isHovered: state.events.hovered.has(id),
        isDeletable: id !== ROOT_NODE && query.node(id).isDeletable(),
      };
    });

  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        onClick={() => actions.selectNode(id)}
        className={`group flex items-center gap-1 pr-2 py-1 rounded cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-50 text-blue-700"
            : isHovered
            ? "bg-gray-50 text-gray-800"
            : "text-gray-600 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: depth * 12 + 6 }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="text-gray-400 hover:text-gray-700 shrink-0"
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <span className="w-[13px] shrink-0" />
        )}

        <Box size={12} className="shrink-0 opacity-60" />
        <span className={`flex-1 truncate text-[11px] ${hidden ? "opacity-40" : ""}`}>
          {name}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            actions.setHidden(id, !hidden);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 shrink-0"
          title={hidden ? "Show" : "Hide"}
        >
          {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        {isDeletable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.delete(id);
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 shrink-0"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div>
          {children.map((childId) => (
            <LayerRow key={childId} id={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Navigator = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-gray-900">Navigator</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Layer tree of the page</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 pb-20">
        <LayerRow id={ROOT_NODE} depth={0} />
      </div>
    </div>
  );
};
