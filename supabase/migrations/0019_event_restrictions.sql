-- Migration 0019: Event Restrictions by Department & Academic Year

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS allowed_departments text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allowed_years text[] DEFAULT '{}';
