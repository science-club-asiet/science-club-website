import { coreEntries } from "./core";
import { blockEntries } from "./blocks";
import { formEntries } from "./forms";
import { advancedEntries } from "./advanced";
import { makeCraftComponent } from "./makeCraftComponent";
import { CATEGORY_ORDER, CATEGORY_LABEL, type RegistryEntry, type Category } from "./types";

/**
 * The single source of truth. Toolbox, editor resolver, inspector and the
 * public renderer all derive from this array. Adding a working component = add
 * one entry (in core.tsx / blocks.tsx / forms.tsx / advanced.tsx).
 */
export const registry: RegistryEntry[] = [
  ...coreEntries,
  ...blockEntries,
  ...formEntries,
  ...advancedEntries,
];

export const entriesByType: Record<string, RegistryEntry> = Object.fromEntries(
  registry.map((e) => [e.type, e])
);

/** type → Craft user-component, for <Editor resolver={...}>. */
export const resolver: Record<string, React.ComponentType<any>> = Object.fromEntries(
  registry.map((e) => [e.type, e.editorComponent ?? makeCraftComponent(e)])
);

export type ToolboxGroup = { category: Category; label: string; items: RegistryEntry[] };

export const toolboxGroups: ToolboxGroup[] = CATEGORY_ORDER.map((category) => ({
  category,
  label: CATEGORY_LABEL[category],
  items: registry.filter((e) => e.category === category),
})).filter((g) => g.items.length > 0);

export const getEntry = (type: string): RegistryEntry | undefined => entriesByType[type];

export type { RegistryEntry, FieldSchema } from "./types";
