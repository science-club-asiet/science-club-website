import React, { useEffect, useState } from "react";
import { useNode } from "@craftjs/core";
import { Database } from "lucide-react";
import { getPublishedItems } from "@/lib/admin/cmsActions";
import { settingsComponentFor } from "./makeCraftComponent";
import { ItemContext } from "../lib/binding";
import type { FieldSchema, RegistryEntry } from "./types";

const collectionListSettings: FieldSchema[] = [
  { kind: "text", name: "collection", label: "Collection slug" },
  { kind: "number", name: "limit", label: "Max items", min: 1, max: 50 },
  {
    kind: "select", name: "sort", label: "Sort",
    options: [
      { label: "Newest first", value: "newest" },
      { label: "Oldest first", value: "oldest" },
      { label: "Custom order", value: "custom" },
    ],
  },
];

const clDefaultStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "20px",
  width: "100%",
  position: "relative",
};

type CollectionListProps = {
  collection?: string;
  limit?: number;
  sort?: "newest" | "oldest" | "custom";
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Editor: renders the item template ONCE, previewing the first published item
 *  so bound elements show real data. Public rendering repeats it per item
 *  (handled in NexusRenderer). */
const CollectionListEditor = (props: CollectionListProps) => {
  const { connectors: { connect, drag } } = useNode();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let on = true;
    if (props.collection) {
      getPublishedItems(props.collection, { limit: 1, sort: props.sort })
        .then((r) => { if (on) setItem(r.items[0]?.data ?? null); })
        .catch(() => { if (on) setItem(null); });
    }
    return () => { on = false; };
  }, [props.collection, props.sort]);

  const activeItem = props.collection ? item : null;

  return (
    <div ref={(r) => { if (r) connect(drag(r)); }} style={props.style}>
      {!props.collection && (
        <div style={{ gridColumn: "1 / -1", padding: 16, border: "1px dashed #cbd5e1", borderRadius: 8, color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
          Collection List — pick a collection slug in Settings, then build one item template inside.
        </div>
      )}
      <ItemContext.Provider value={activeItem}>{props.children}</ItemContext.Provider>
    </div>
  );
};
CollectionListEditor.craft = {
  displayName: "Collection List",
  props: { collection: "", limit: 6, sort: "newest", style: { ...clDefaultStyle } },
  rules: { canDrag: () => true },
  related: { settings: settingsComponentFor(collectionListSettings) },
};

export const cmsEntries: RegistryEntry[] = [
  {
    type: "CollectionList",
    label: "Collection List",
    icon: Database,
    category: "sections",
    isCanvas: true,
    // Public per-item rendering is intercepted in NexusRenderer; this render is
    // only the wrapping grid.
    render: ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => (
      <div style={style}>{children}</div>
    ),
    defaultProps: { collection: "", limit: 6, sort: "newest", style: { ...clDefaultStyle } },
    settings: collectionListSettings,
    editorComponent: CollectionListEditor,
  },
];
