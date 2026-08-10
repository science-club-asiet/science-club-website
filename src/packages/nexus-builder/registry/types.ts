import type React from "react";
import type { NodeRules } from "@craftjs/core";

/**
 * A single editable control in a component's Settings tab. `name` is the prop
 * key the control reads/writes via Craft `setProp`.
 */
export type FieldSchema =
  | { kind: "text" | "textarea" | "color" | "link"; name: string; label: string; placeholder?: string }
  | { kind: "number"; name: string; label: string; min?: number; max?: number; step?: number; unit?: string }
  | { kind: "toggle"; name: string; label: string }
  | { kind: "select"; name: string; label: string; options: { label: string; value: string | number }[] }
  | { kind: "image"; name: string; label: string }
  | { kind: "icon"; name: string; label: string }
  | { kind: "linkTarget"; name: string; label: string } // manages url + target + rel props
  | { kind: "visibility"; name: string; label: string } // manages props.hideOn (per-breakpoint)
  | { kind: "array"; name: string; label: string; item: FieldSchema[]; itemLabel?: string };

/** Which universal Style sections a component exposes (Gutenberg `supports` idea). */
export type StyleGroup =
  | "layout" | "spacing" | "size" | "position"
  | "typography" | "background" | "border" | "effects";

export const ALL_STYLE_GROUPS: StyleGroup[] = [
  "layout", "spacing", "size", "position", "typography", "background", "border", "effects",
];

export type Category =
  | "layout"
  | "typography"
  | "media"
  | "forms"
  | "sections"
  | "advanced";

/**
 * Everything needed to make a component work everywhere — the toolbox, the
 * editor canvas, the inspector, and the public renderer are all derived from
 * this one definition.
 *
 * `render` is a PURE presentational component: it applies `props.style` to its
 * single root host element and renders `children`. It is used both by the
 * editor (wrapped with drag/select connectors) and by the static public
 * renderer (called directly). Components needing bespoke editor behaviour
 * (inline text editing) provide `editorComponent` instead of relying on the
 * generic wrapper.
 */
export type RegistryEntry = {
  type: string; // stable key = resolver name = serialized type
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  category: Category;
  isCanvas?: boolean; // droppable container
  render: (props: Record<string, unknown> & { style?: React.CSSProperties; children?: React.ReactNode }) => React.ReactElement;
  defaultProps: Record<string, unknown>; // must include a `style` object
  settings: FieldSchema[];
  /** Which Style-tab sections apply to this component. Omit = all. */
  styleGroups?: StyleGroup[];
  rules?: Partial<NodeRules>;
  /**
   * When true, the component's inner content is made non-interactive in the
   * editor (its links / inputs won't capture clicks) so the node stays
   * selectable and draggable. Used by live sections and form fields.
   */
  editorInert?: boolean;
  /** Escape hatch: a fully-built Craft user-component (e.g. inline-editable text). */
  editorComponent?: React.ComponentType<Record<string, unknown>> & { craft?: Record<string, unknown> };
};

export const CATEGORY_ORDER: Category[] = [
  "layout",
  "typography",
  "media",
  "sections",
  "forms",
  "advanced",
];

export const CATEGORY_LABEL: Record<Category, string> = {
  layout: "Layout",
  typography: "Basic",
  media: "Media",
  sections: "Sections",
  forms: "Forms",
  advanced: "Advanced",
};
