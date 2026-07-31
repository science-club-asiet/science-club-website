import { useEffect, type MutableRefObject } from "react";
import { useEditor } from "@craftjs/core";
import { saveNexusData } from "@/lib/admin/nexusActions";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Lives inside <Editor> so it can read the serialized tree via useEditor. It
 * builds the save function and hands it up to the parent through `saveRef`, so
 * both the top-bar button and the Cmd+S shortcut invoke one shared save.
 */
export const SaveBinder = ({
  kind,
  id,
  saveRef,
  setDirty,
  setSaveState,
  setLastSaved,
}: {
  kind: string;
  id: string;
  saveRef: MutableRefObject<() => Promise<void>>;
  setDirty: (v: boolean) => void;
  setSaveState: (v: SaveState) => void;
  setLastSaved: (v: Date) => void;
}) => {
  const { query } = useEditor();

  useEffect(() => {
    saveRef.current = async () => {
      setSaveState("saving");
      try {
        const serialized = query.serialize();
        // Persist the parsed object so the jsonb column holds real JSON rather
        // than a double-encoded string.
        await saveNexusData(kind, id, JSON.parse(serialized));
        setDirty(false);
        setLastSaved(new Date());
        setSaveState("saved");
      } catch (e) {
        console.error("Nexus save failed:", e);
        setSaveState("error");
      }
    };
  }, [query, kind, id, saveRef, setDirty, setSaveState, setLastSaved]);

  return null;
};
