-- Phase B: Members CRM
ALTER TABLE public.profiles ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
