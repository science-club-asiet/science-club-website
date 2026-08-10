"use client";

import { createContext, useContext } from "react";

/**
 * CMS dynamic binding. A Collection List provides the current item's data via
 * `ItemContext`; elements inside with a `bindField` prop pull their primary
 * content from that field (Webflow's "Get text from → field").
 */
export type ItemData = Record<string, unknown> | null;

export const ItemContext = createContext<ItemData>(null);
export const useItem = () => useContext(ItemContext);

/** The prop each component type fills when bound to a field. */
const PRIMARY: Record<string, string> = {
  Heading: "text", Text: "text", Button: "text", Link: "text", Badge: "text", Quote: "text",
  RichText: "html", Image: "src", Video: "src",
};

export const isBindable = (type: string) => type in PRIMARY;

/** Substitute the primary prop with `item[bindField]` when bound. */
export function resolveBindings<T extends Record<string, unknown>>(type: string, props: T, item: ItemData): T {
  const field = props?.bindField as string | undefined;
  if (!field || !item) return props;
  const prop = PRIMARY[type];
  if (!prop) return props;
  const v = item[field];
  if (v == null || v === "") return props;
  return { ...props, [prop]: String(v) };
}
