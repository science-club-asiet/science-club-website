import { ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, Pencil, ExternalLink, CheckCircle2, Loader2, AlertCircle, CircleDashed } from "lucide-react";
import Link from "next/link";
import { useEditor } from "@craftjs/core";
import type { SaveState } from "../../lib/SaveBinder";

type TopBarProps = {
  setViewportWidth: (w: string) => void;
  viewportWidth: string;
  title: string;
  backHref: string;
  previewHref?: string;
  onSave: () => void;
  dirty: boolean;
  saveState: SaveState;
  lastSaved: Date | null;
};

const StatusPill = ({ dirty, saveState, lastSaved }: { dirty: boolean; saveState: SaveState; lastSaved: Date | null }) => {
  if (saveState === "saving") {
    return (
      <span className="flex items-center text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
        <Loader2 size={12} className="mr-1 animate-spin" /> Saving…
      </span>
    );
  }
  if (saveState === "error") {
    return (
      <span className="flex items-center text-[10px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-100">
        <AlertCircle size={12} className="mr-1" /> Save failed
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="flex items-center text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
        <CircleDashed size={12} className="mr-1" /> Unsaved changes
      </span>
    );
  }
  return (
    <span className="flex items-center text-[10px] text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100">
      <CheckCircle2 size={12} className="mr-1" />
      {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Saved"}
    </span>
  );
};

export const TopBar = ({
  setViewportWidth,
  viewportWidth,
  title,
  backHref,
  previewHref,
  onSave,
  dirty,
  saveState,
  lastSaved,
}: TopBarProps) => {
  const { canUndo, canRedo, enabled, actions } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
    enabled: state.options.enabled,
  }));
  const { history } = actions;

  const saving = saveState === "saving";

  return (
    <div className="h-14 bg-white border-b border-[#ECEEF2] flex items-center justify-between px-4 z-20 shrink-0">

      {/* LEFT: Breadcrumbs & Status */}
      <div className="flex items-center space-x-4">
        <Link href={backHref} className="p-2 hover:bg-[#F1F3F6] rounded-md text-[#6B7280] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center text-xs text-[#6B7280] font-medium">
          <span className="text-gray-900 font-semibold">{title}</span>
        </div>
        <StatusPill dirty={dirty} saveState={saveState} lastSaved={lastSaved} />
      </div>

      {/* CENTER: Viewport Controls & History */}
      <div className="flex items-center space-x-6">

        {/* Device Switcher */}
        <div className="flex items-center bg-[#F6F7F9] rounded-md border border-[#ECEEF2] p-1">
          <button
            onClick={() => setViewportWidth("100%")}
            title="Desktop"
            className={`p-1.5 rounded-sm transition-colors ${viewportWidth === "100%" ? "bg-white shadow-sm text-blue-600" : "text-[#9CA3AF] hover:text-gray-600"}`}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setViewportWidth("768px")}
            title="Tablet"
            className={`p-1.5 rounded-sm transition-colors ${viewportWidth === "768px" ? "bg-white shadow-sm text-blue-600" : "text-[#9CA3AF] hover:text-gray-600"}`}
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setViewportWidth("375px")}
            title="Mobile"
            className={`p-1.5 rounded-sm transition-colors ${viewportWidth === "375px" ? "bg-white shadow-sm text-blue-600" : "text-[#9CA3AF] hover:text-gray-600"}`}
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center space-x-1 border-l border-[#ECEEF2] pl-6">
          <button
            disabled={!canUndo}
            onClick={() => history.undo()}
            title="Undo (⌘Z)"
            className={`p-1.5 rounded-md transition-colors ${canUndo ? "text-gray-600 hover:bg-[#F1F3F6]" : "text-gray-300 cursor-not-allowed"}`}
          >
            <Undo2 size={16} />
          </button>
          <button
            disabled={!canRedo}
            onClick={() => history.redo()}
            title="Redo (⌘⇧Z)"
            className={`p-1.5 rounded-md transition-colors ${canRedo ? "text-gray-600 hover:bg-[#F1F3F6]" : "text-gray-300 cursor-not-allowed"}`}
          >
            <Redo2 size={16} />
          </button>
        </div>

      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => actions.setOptions((o) => (o.enabled = !enabled))}
          title={enabled ? "Preview (interact with the page)" : "Back to editing"}
          className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors shadow-sm ${
            enabled
              ? "text-gray-700 bg-white border-[#ECEEF2] hover:bg-[#F6F7F9]"
              : "text-white bg-gray-900 border-gray-900 hover:bg-gray-800"
          }`}
        >
          {enabled ? <Eye size={14} className="mr-2 text-[#6B7280]" /> : <Pencil size={14} className="mr-2" />}
          {enabled ? "Preview" : "Editing"}
        </button>
        {previewHref && (
          <Link
            href={previewHref}
            target="_blank"
            title="Open the live page in a new tab"
            className="flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-[#ECEEF2] rounded-md hover:bg-[#F6F7F9] transition-colors shadow-sm"
          >
            <ExternalLink size={14} className="mr-2 text-[#6B7280]" />
            Open
          </Link>
        )}
        <button
          onClick={onSave}
          disabled={saving || (!dirty && saveState === "saved")}
          title="Save (⌘S)"
          className="flex items-center px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Publishing…" : dirty ? "Publish" : "Published"}
        </button>
      </div>

    </div>
  );
};
