import { useEditor } from "@craftjs/core";
import { useCallback } from "react";
import { getCloneTree } from "./clone";

/**
 * Returns a `duplicate(nodeId)` callback that clones a node (with fresh ids)
 * and inserts the copy directly after the original, inside the same parent —
 * then selects the copy. Mirrors Webflow's Cmd+D behaviour.
 */
export function useDuplicate() {
  const { query, actions } = useEditor();

  return useCallback(
    (nodeId?: string) => {
      if (!nodeId) return;
      const node = query.node(nodeId).get();
      const parentId = node.data.parent;
      if (!parentId) return; // never duplicate ROOT

      const siblings = query.node(parentId).get().data.nodes;
      const index = siblings.indexOf(nodeId);

      const tree = getCloneTree(query as unknown as Parameters<typeof getCloneTree>[0], nodeId);
      actions.addNodeTree(tree, parentId, index + 1);
      actions.selectNode(tree.rootNodeId);
    },
    [query, actions]
  );
}
