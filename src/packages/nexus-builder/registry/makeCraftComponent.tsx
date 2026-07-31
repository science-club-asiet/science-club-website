import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { SettingsFields } from "../inspector/SettingsFields";
import type { FieldSchema, RegistryEntry } from "./types";

/** A settings component (bound to node context via Craft's `related`). */
export const settingsComponentFor = (schema: FieldSchema[]) => {
  const Settings = () => <SettingsFields schema={schema} />;
  Settings.displayName = "NexusSettings";
  return Settings;
};

/** Editor-only hint shown inside an empty droppable container. */
const EmptyHint = () => (
  <div
    style={{
      minHeight: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px dashed #cbd5e1",
      borderRadius: 6,
      color: "#94a3b8",
      fontSize: 12,
      width: "100%",
    }}
  >
    Drop elements here
  </div>
);

/**
 * Wrap a registry entry's pure `render` into a Craft user-component: it attaches
 * the drag/select connectors to the render's single root host element (via
 * cloneElement) and carries the `.craft` config (defaults, rules, schema-driven
 * settings) Craft needs. Canvas entries render their Craft children because the
 * render forwards `props.children`.
 */
export function makeCraftComponent(entry: RegistryEntry) {
  const Comp = (props: any) => {
    const {
      connectors: { connect, drag },
    } = useNode();
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
    const setRef = (dom: HTMLElement | null) => {
      if (dom) connect(drag(dom));
    };
    const element = entry.render(props) as React.ReactElement<any>;

    // Preview mode: render exactly as the public page would — fully interactive,
    // no inert wrapper, no empty hint, no selection chrome.
    if (!enabled) {
      return React.cloneElement(element, { ref: setRef } as any);
    }

    // Inert components (live sections / form fields): keep the styled root as
    // the draggable node, but neutralise pointer events on its inner content so
    // internal links / inputs don't steal clicks from selection.
    if (entry.editorInert) {
      return React.cloneElement(
        element,
        { ref: setRef } as any,
        <div style={{ pointerEvents: "none" }}>{element.props.children}</div>
      );
    }

    // Empty droppable container: show an editor-only hint so it's visible and
    // easy to drop into (the persisted style stays hug-content on public pages).
    if (entry.isCanvas && React.Children.count(props.children) === 0) {
      return React.cloneElement(element, { ref: setRef } as any, <EmptyHint />);
    }

    return React.cloneElement(element, { ref: setRef } as any);
  };

  Comp.displayName = entry.type;
  Comp.craft = {
    displayName: entry.label,
    props: entry.defaultProps,
    rules: entry.rules ?? { canDrag: () => true },
    related: entry.settings.length ? { settings: settingsComponentFor(entry.settings) } : {},
  };

  return Comp;
}
