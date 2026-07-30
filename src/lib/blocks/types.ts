export type Block = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

// Inspector field descriptors (right-hand panel of the builder).
export type InspectorField =
  | { key: string; label: string; type: "text" | "textarea" | "image" | "date" | "boolean" }
  | {
      key: string;
      label: string;
      type: "list";
      itemLabel: string;
      itemFields: { key: string; label: string; type: "text" | "textarea" | "image" }[];
      defaultItem: Record<string, unknown>;
    };
