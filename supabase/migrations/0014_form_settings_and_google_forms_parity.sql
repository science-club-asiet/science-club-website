-- Migration 0014: Form Settings & Google Forms Parity
-- Alters field_type enum to text to prevent section/scale/file enum crashes,
-- and adds form-level response settings, auto-closing triggers, custom messages, etc.

-- Prevent enum crash when inserting section, scale, file, or time field types:
ALTER TABLE public.form_fields ALTER COLUMN field_type TYPE text USING field_type::text;

ALTER TABLE public.forms
  ADD COLUMN IF NOT EXISTS confirmation_message text DEFAULT 'Thank you! Your response has been recorded.',
  ADD COLUMN IF NOT EXISTS closed_message text DEFAULT 'This form is no longer accepting responses.',
  ADD COLUMN IF NOT EXISTS close_at timestamptz,
  ADD COLUMN IF NOT EXISTS max_responses integer,
  ADD COLUMN IF NOT EXISTS limit_one_per_user boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_submit_another boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS collect_email_type text NOT NULL DEFAULT 'DO_NOT_COLLECT',
  ADD COLUMN IF NOT EXISTS header_image_url text;

ALTER TABLE public.form_fields
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS validation_rule jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS allow_other boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shuffle_options boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scale_min integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS scale_max integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS scale_min_label text,
  ADD COLUMN IF NOT EXISTS scale_max_label text,
  ADD COLUMN IF NOT EXISTS grid_rows jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grid_columns jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS file_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS max_file_size text DEFAULT '10MB',
  ADD COLUMN IF NOT EXISTS max_files integer DEFAULT 1;
