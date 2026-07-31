"use client";

import React, { useEffect, useState } from "react";
import { getEntry } from "./registry";
import { hasResponsive, responsiveCss, hasHideOn, visibilityCss, type ResponsiveStyles, type HideOn } from "./lib/responsive";
import {
  animationProps, ANIMATION_CSS, ANIMATION_NOSCRIPT_CSS, NexusAnimationRuntime, type AnimationConfig,
} from "./lib/animation";
import { resolveBindings, type ItemData } from "./lib/binding";
import { getPublishedItems } from "@/lib/admin/cmsActions";

/**
 * Static public renderer. Walks the serialized Craft tree and renders each node
 * via its registry `render` — no @craftjs/core runtime on the public page. Nodes
 * with responsive overrides get `data-nx` + scoped `@media` CSS; nodes with an
 * entrance animation get `data-nx-anim` + the shared animation CSS/runtime.
 * Runs as a client component so widgets / forms / live blocks work, but SSRs.
 */

type SerializedNode = {
  type: { resolvedName: string } | string;
  props: Record<string, any>;
  nodes?: string[];
  hidden?: boolean;
};
type SerializedNodes = Record<string, SerializedNode>;
type Acc = { css: string[]; anim: boolean };

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

/** Repeats an item template for every published item in a collection. */
function CollectionListRenderer({
  collection, limit, sort, style, renderItem,
}: {
  collection: string; limit?: number; sort?: string; style?: React.CSSProperties;
  renderItem: (item: Record<string, any>) => React.ReactNode;
}) {
  const [items, setItems] = useState<Record<string, any>[] | null>(null);
  useEffect(() => {
    let on = true;
    if (!collection) { setItems([]); return; }
    getPublishedItems(collection, { limit, sort: sort as any })
      .then((r) => { if (on) setItems(r.items.map((i) => i.data)); })
      .catch(() => { if (on) setItems([]); });
    return () => { on = false; };
  }, [collection, limit, sort]);

  if (!items || !items.length) return <div style={style} />;
  return <div style={style}>{items.map((it, i) => <React.Fragment key={i}>{renderItem(it)}</React.Fragment>)}</div>;
}

function renderNode(id: string, nodes: SerializedNodes, acc: Acc, item: ItemData = null): React.ReactNode {
  const node = nodes[id];
  if (!node || node.hidden) return null;

  const typeName = typeof node.type === "string" ? node.type : node.type?.resolvedName;
  const entry = typeName ? getEntry(typeName) : undefined;
  const childIds = node.nodes ?? [];

  // Collection List: render its child template once per published item.
  if (typeName === "CollectionList") {
    const p = node.props ?? {};
    return (
      <CollectionListRenderer
        key={id}
        collection={p.collection}
        limit={p.limit}
        sort={p.sort}
        style={p.style}
        renderItem={(itemData) => childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid, nodes, acc, itemData)}</React.Fragment>)}
      />
    );
  }

  const children = childIds.length
    ? childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid, nodes, acc, item)}</React.Fragment>)
    : undefined;

  if (!entry) {
    return children ? <div>{children}</div> : null;
  }

  const props = resolveBindings(typeName!, node.props ?? {}, item);
  const element = entry.render({ ...props, children }) as React.ReactElement<any>;

  const extra: Record<string, any> = {};
  let style = { ...(element.props.style || {}) };
  let clone = false;

  const responsive = props.responsive as ResponsiveStyles | undefined;
  if (hasResponsive(responsive)) {
    const chunk = responsiveCss(id, responsive);
    if (chunk) acc.css.push(chunk);
    extra["data-nx"] = id;
    clone = true;
  }

  const hideOn = props.hideOn as HideOn | undefined;
  if (hasHideOn(hideOn)) {
    const chunk = visibilityCss(id, hideOn);
    if (chunk) acc.css.push(chunk);
    extra["data-nx"] = id;
    clone = true;
  }

  const aProps = animationProps(props.animation as AnimationConfig | undefined);
  if (Object.keys(aProps).length) {
    extra["data-nx-anim"] = aProps["data-nx-anim"];
    extra["data-nx-trigger"] = aProps["data-nx-trigger"];
    style = { ...style, ...aProps.style };
    acc.anim = true;
    clone = true;
  }

  if (clone) {
    extra.style = style;
    return React.cloneElement(element, extra);
  }
  return element;
}

export function NexusRenderer({ data }: { data: unknown }) {
  const nodes = parse(data);
  if (!nodes) return null;
  const acc: Acc = { css: [], anim: false };
  const tree = renderNode("ROOT", nodes, acc);
  return (
    <>
      {acc.css.length > 0 && <style dangerouslySetInnerHTML={{ __html: acc.css.join("") }} />}
      {acc.anim && (
        <>
          <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />
          <noscript><style dangerouslySetInnerHTML={{ __html: ANIMATION_NOSCRIPT_CSS }} /></noscript>
          <NexusAnimationRuntime />
        </>
      )}
      {tree}
    </>
  );
}
