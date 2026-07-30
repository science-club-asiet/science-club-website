import { BLOCK_REGISTRY } from "@/lib/blocks/registry";
import type { Block } from "@/lib/blocks/types";

/** Renders a block tree. Used by the public page AND the builder canvas. */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b) => {
        const def = BLOCK_REGISTRY[b.type];
        if (!def) return null;
        const C = def.Component;
        return <C key={b.id} props={b.props} />;
      })}
    </>
  );
}
