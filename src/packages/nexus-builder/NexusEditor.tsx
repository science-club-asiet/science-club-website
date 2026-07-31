"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { SidebarLeft } from "./components/shell/SidebarLeft";
import { Navigator } from "./components/shell/Navigator";
import { AssetsPanel } from "./components/shell/AssetsPanel";
import { TemplatesPanel } from "./components/shell/TemplatesPanel";
import { InspectorRight } from "./components/shell/InspectorRight";
import { TopBar } from "./components/shell/TopBar";
import { RenderNode } from "./components/canvas/RenderNode";
import { Shortcuts } from "./components/canvas/Shortcuts";
import { SaveBinder, type SaveState } from "./lib/SaveBinder";
import { EnabledProvider } from "./lib/editorState";
import { BreakpointContext, bpFromWidth } from "./lib/responsive";
import { Plus, Layers, ImageIcon, LayoutTemplate } from "lucide-react";
import { resolver } from "./registry";

export type NexusEditorProps = {
  kind: string;
  id: string;
  data: any;
  title: string;
  backHref: string;
  previewHref?: string;
};

type LeftPanel = "add" | "layouts" | "layers" | "assets";

export const NexusEditor = ({ kind, id, data, title, backHref, previewHref }: NexusEditorProps) => {
  const [viewportWidth, setViewportWidth] = useState("100%");
  const [leftPanel, setLeftPanel] = useState<LeftPanel>("add");
  const breakpoint = bpFromWidth(viewportWidth);

  // Save / dirty state — the single source of truth, shared with TopBar,
  // Shortcuts and SaveBinder.
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const readyRef = useRef(false);
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const triggerSave = useCallback(() => saveRef.current(), []);

  // Only start flagging changes once the initial deserialize has settled.
  useEffect(() => {
    const t = setTimeout(() => { readyRef.current = true; }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleNodesChange = useCallback(() => {
    if (!readyRef.current) return;
    setDirty(true);
    setSaveState((s) => (s === "saving" ? s : "idle"));
  }, []);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const isDataValid = React.useMemo(() => {
    if (!data) return false;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed && Object.keys(parsed).length > 0 && parsed.ROOT;
    } catch {
      return false;
    }
  }, [data]);

  return (
    <BreakpointContext.Provider value={breakpoint}>
    <div className="h-screen w-full flex flex-col bg-white text-gray-900 font-inter overflow-hidden">
      <Editor
        resolver={resolver}
        onRender={RenderNode}
        onNodesChange={handleNodesChange}
        indicator={{
          success: "#2563eb",
          error: "#ef4444",
          thickness: 3,
          style: { borderRadius: "2px" },
        }}
      >
        <EnabledProvider>
        <SaveBinder
          kind={kind}
          id={id}
          saveRef={saveRef}
          setDirty={setDirty}
          setSaveState={setSaveState}
          setLastSaved={setLastSaved}
        />
        <Shortcuts onSave={triggerSave} />

        {/* Top Navigation Bar */}
        <TopBar
          setViewportWidth={setViewportWidth}
          viewportWidth={viewportWidth}
          title={title}
          backHref={backHref}
          previewHref={previewHref}
          onSave={triggerSave}
          dirty={dirty}
          saveState={saveState}
          lastSaved={lastSaved}
        />

        <div className="flex-1 flex overflow-hidden">

          {/* Far-Left Navigation Rail */}
          <div className="w-[60px] h-full flex-shrink-0 border-r border-gray-200 bg-white flex flex-col items-center py-4 space-y-2 z-20">
            <button
              onClick={() => setLeftPanel("add")}
              title="Add elements"
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                leftPanel === "add" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setLeftPanel("layouts")}
              title="Layouts"
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                leftPanel === "layouts" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <LayoutTemplate size={20} />
            </button>
            <button
              onClick={() => setLeftPanel("layers")}
              title="Navigator"
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                leftPanel === "layers" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Layers size={20} />
            </button>
            <button
              onClick={() => setLeftPanel("assets")}
              title="Assets"
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                leftPanel === "assets" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <ImageIcon size={20} />
            </button>
          </div>

          {/* Left Sidebar (Blocks / Navigator / Assets) */}
          <div className="w-[280px] h-full flex-shrink-0 border-r border-gray-200 bg-white shadow-sm z-10 flex flex-col">
            {leftPanel === "add" && <SidebarLeft />}
            {leftPanel === "layouts" && <TemplatesPanel />}
            {leftPanel === "layers" && <Navigator />}
            {leftPanel === "assets" && <AssetsPanel />}
          </div>

          {/* Canvas Wrapper (scroll container — RenderNode listens on .craftjs-renderer) */}
          <div className="craftjs-renderer flex-1 h-full overflow-auto bg-gray-100 flex justify-center py-8">
            <div
              style={{ width: viewportWidth, transition: "width 0.3s ease" }}
              className="bg-white shadow-lg min-h-full border border-gray-200"
            >
              {isDataValid ? (
                <Frame data={typeof data === "string" ? data : JSON.stringify(data)} />
              ) : (
                <Frame>
                  <Element is={resolver.Container} canvas>
                    {React.createElement(resolver.Heading, { text: "Welcome to Nexus Builder" })}
                    {React.createElement(resolver.Text, {
                      text: "Drag elements from the left panel onto the canvas to start building. Drop layout blocks inside each other to nest.",
                    })}
                  </Element>
                </Frame>
              )}
            </div>
          </div>

          {/* Right Inspector (Settings Panel) */}
          <div className="w-[320px] h-full flex-shrink-0 border-l border-gray-200 bg-white shadow-sm z-10 overflow-y-auto">
            <InspectorRight />
          </div>
        </div>
        </EnabledProvider>

      </Editor>
    </div>
    </BreakpointContext.Provider>
  );
};
