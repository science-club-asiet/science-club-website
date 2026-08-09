// Shared (client + server) types for the form builder.

export type ValidationRule = {
  type?: "email" | "url" | "number" | "length" | "regex";
  subtype?: "greater_than" | "less_than" | "equal_to" | "between" | "is_number" | "whole_number" | "max_char" | "min_char" | "contains" | "matches";
  value?: string | number;
  value2?: string | number;
  customError?: string;
};

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
  image_url?: string | null;
  validation_rule?: ValidationRule;
  allow_other?: boolean;
  shuffle_options?: boolean;
  scale_min?: number;
  scale_max?: number;
  scale_min_label?: string | null;
  scale_max_label?: string | null;
  grid_rows?: string[];
  grid_columns?: string[];
  file_types?: string[];
  max_file_size?: string;
  max_files?: number;
  upload_folder?: string | null;
};

export type FormSettings = {
  title: string;
  slug: string;
  description?: string | null;
  purpose: string;
  is_active: boolean;
  confirmation_message?: string;
  closed_message?: string;
  close_at?: string | null;
  max_responses?: number | null;
  limit_one_per_user?: boolean;
  show_submit_another?: boolean;
  collect_email_type?: "DO_NOT_COLLECT" | "VERIFIED" | "RESPONDER_INPUT";
  header_image_url?: string | null;
};

export const FIELD_TYPES = [
  "text",
  "textarea",
  "radio",
  "multiselect",
  "select",
  "image",
  "scale",
  "file",
  "date",
  "time",
  "checkbox",
  "grid_radio",
  "grid_checkbox",
  "section",
] as const;

export const FIELDS_WITH_OPTIONS = new Set(["select", "multiselect", "radio"]);
