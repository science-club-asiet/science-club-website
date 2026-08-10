-- Migration 0016: Form Categories & Default Presets Seed

CREATE TABLE IF NOT EXISTS public.form_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.form_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read form_categories" ON public.form_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin write form_categories" ON public.form_categories FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed default form categories
INSERT INTO public.form_categories (name, slug, description, sort_order)
VALUES
  ('General', 'general', 'Default category for standard club forms', 1),
  ('Registrations', 'registrations', 'Event, workshop, and hackathon registration forms', 2),
  ('Recruitment', 'recruitment', 'Membership intake and Execom recruitment applications', 3),
  ('Feedback', 'feedback', 'Post-event feedback, polls, and opinion surveys', 4),
  ('Competitions', 'competitions', 'Submission forms for hackathons and project contests', 5)
ON CONFLICT (slug) DO NOTHING;
