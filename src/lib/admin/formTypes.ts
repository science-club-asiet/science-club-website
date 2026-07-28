// Shared (client + server) types for the form builder. Kept out of the
// "use server" actions file so the types can be imported anywhere.

export type BuilderField = {
  id: string;
  label: string;
  field_key: string;
  field_type: string;
  required: boolean;
  placeholder: string;
  help_text: string;
  options: string[];
  display_order: number;
};

export const FIELD_TYPES = [
  "text", "textarea", "email", "phone", "number",
  "select", "multiselect", "checkbox", "radio", "date",
] as const;

export const FIELDS_WITH_OPTIONS = new Set(["select", "multiselect", "radio"]);
