"use client";

import React, { createContext, useContext } from "react";
import { useEditor } from "@craftjs/core";

/**
 * Broadcasts `enabled` (edit vs preview) via context so individual components
 * don't each open a store subscription just to read it. One subscription here
 * instead of one per node — meaningfully less work on every hover/select while
 * editing a large tree.
 */
const EnabledContext = createContext(true);
export const useEnabled = () => useContext(EnabledContext);

export const EnabledProvider = ({ children }: { children: React.ReactNode }) => {
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  return <EnabledContext.Provider value={enabled}>{children}</EnabledContext.Provider>;
};
