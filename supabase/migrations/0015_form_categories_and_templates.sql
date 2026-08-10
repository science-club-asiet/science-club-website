-- Migration 0015: Form Categories & Presets/Templates Parity
-- Adds category and is_template columns to forms table

ALTER TABLE public.forms
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false;

-- Ensure RLS policy allows admins to manage templates
CREATE POLICY "Admins can manage form templates" ON public.forms
  FOR ALL USING (public.is_admin());
