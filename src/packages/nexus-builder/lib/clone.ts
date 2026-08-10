import type { Node, NodeTree } from "@craftjs/core";

// Craft.js does not export its internal id generator, so we mint our own.
// Node ids are just opaque strings; any collision-resistant value works.
const randomId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

type Query = {
  node: (id: string) => { toNodeTree: () => NodeTree };
  parseFreshNode: (node: { id: string; data: Node["data"] }) => { toNode: () => Node };
};

/**
 * Deep-clone a node (and all of its descendants / linked nodes) into a brand
 * new NodeTree with freshly generated ids, so it can be handed to
 * `actions.addNodeTree(...)`. This is the canonical Craft.js duplicate recipe —
 * without regenerating ids you'd get "duplicate node" corruption.
 */
export function getCloneTree(query: Query, idToClone: string): NodeTree {
  const tree = query.node(idToClone).toNodeTree();
  const newNodes: Record<string, Node> = {};

  const changeNodeId = (node: Node, newParentId?: string): string => {
    const newNodeId = randomId();

    const childNodes = (node.data.nodes || []).map((childId) =>
      changeNodeId(tree.nodes[childId], newNodeId)
    );

    const linkedNodes = Object.keys(node.data.linkedNodes || {}).reduce(
      (acc, key) => {
        const linkedId = node.data.linkedNodes[key];
        acc[key] = changeNodeId(tree.nodes[linkedId], newNodeId);
        return acc;
      },
      {} as Record<string, string>
    );

    const tmpNode = {
      id: newNodeId,
      data: {
        ...node.data,
        parent: newParentId || node.data.parent,
        nodes: childNodes,
        linkedNodes,
      },
    };

    const freshNode = query.parseFreshNode(tmpNode as { id: string; data: Node["data"] }).toNode();
    newNodes[newNodeId] = freshNode;
    return newNodeId;
  };

  const rootNodeId = changeNodeId(tree.nodes[tree.rootNodeId]);
  return { rootNodeId, nodes: newNodes };
}
