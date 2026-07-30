-- Phase A: Applications as a Kanban Pipeline
ALTER TABLE public.membership_applications ADD COLUMN stage text NOT NULL DEFAULT 'submitted';

-- Backfill stage from status
UPDATE public.membership_applications SET stage = 'submitted' WHERE status = 'pending';
UPDATE public.membership_applications SET stage = 'accepted' WHERE status = 'approved';
UPDATE public.membership_applications SET stage = 'rejected' WHERE status = 'rejected';
