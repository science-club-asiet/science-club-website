import { useEffect } from "react";
import { useEditor } from "@craftjs/core";
import { useDuplicate } from "../../lib/useDuplicate";

/**
 * Global keyboard shortcuts for the builder. Rendered inside <Editor>. Ignores
 * key events while the user is typing in an input / contentEditable so text
 * editing never triggers a delete.
 */
export const Shortcuts = ({ onSave }: { onSave?: () => void }) => {
  const { actions, query, selected } = useEditor((state) => ({
    selected: Array.from(state.events.selected)[0] as string | undefined,
  }));
  const duplicate = useDuplicate();

  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        el.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Save works even while typing.
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      if (isTyping()) return;

      // Undo / redo
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (query.history.canRedo()) actions.history.redo();
        } else if (query.history.canUndo()) {
          actions.history.undo();
        }
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (query.history.canRedo()) actions.history.redo();
        return;
      }

      if (!selected) return;

      // Duplicate
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicate(selected);
        return;
      }

      // Delete — only if the node allows it (ROOT never does).
      if (e.key === "Delete" || e.key === "Backspace") {
        if (query.node(selected).isDeletable()) {
          e.preventDefault();
          actions.delete(selected);
        }
        return;
      }

      // Deselect
      if (e.key === "Escape") {
        actions.selectNode(undefined);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions, query, selected, duplicate, onSave]);

  return null;
};
