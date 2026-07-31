"use client";

import React from "react";
import { getEntry } from "./registry";

/**
 * Static public renderer. Walks the serialized Craft tree and renders each node
 * via its registry `render` — no @craftjs/core runtime on the public page. Runs
 * as a client component so widget state / form context / live blocks work, but
 * it still SSRs its markup for SEO.
 */

type SerializedNode = {
  type: { resolvedName: string } | string;
  props: Record<string, any>;
  nodes?: string[];
  hidden?: boolean;
};
type SerializedNodes = Record<string, SerializedNode>;

function parse(data: unknown): SerializedNodes | null {
  if (!data) return null;
  try {
    const obj = typeof data === "string" ? JSON.parse(data) : data;
    if (!obj || typeof obj !== "object" || !(obj as any).ROOT) return null;
    return obj as SerializedNodes;
  } catch {
    return null;
  }
}

function renderNode(id: string, nodes: SerializedNodes): React.ReactNode {
  const node = nodes[id];
  if (!node || node.hidden) return null;

  const typeName = typeof node.type === "string" ? node.type : node.type?.resolvedName;
  const entry = typeName ? getEntry(typeName) : undefined;

  const childIds = node.nodes ?? [];
  const children = childIds.length
    ? childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid, nodes)}</React.Fragment>)
    : undefined;

  if (!entry) {
    // Unknown / unresolved type — render its children so the tree isn't lost.
    return children ? <div>{children}</div> : null;
  }

  return entry.render({ ...node.props, children });
}

export function NexusRenderer({ data }: { data: unknown }) {
  const nodes = parse(data);
  if (!nodes) return null;
  return <>{renderNode("ROOT", nodes)}</>;
}
