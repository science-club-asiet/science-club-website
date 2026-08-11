-- Migration 0018: Member Portal — Unique Member ID, Triggers & Membership Settings

-- 1. Add member_id column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS member_id text UNIQUE;

-- 2. Function to generate a unique Member ID in format SC-YYYY-XXXXX
CREATE OR REPLACE FUNCTION public.generate_unique_member_id()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  new_id text;
  done boolean := false;
BEGIN
  WHILE NOT done LOOP
    new_id := 'SC-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 90000 + 10000)::text, 5, '0');
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE member_id = new_id) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$;

-- 3. Backfill existing profiles that do not have a member_id
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE member_id IS NULL LOOP
    UPDATE public.profiles
    SET member_id = public.generate_unique_member_id()
    WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Update trigger to assign member_id on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, member_id)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    CASE WHEN (SELECT count(*) FROM public.profiles) = 0
         THEN 'owner'::user_role ELSE 'member'::user_role END,
    public.generate_unique_member_id()
  );
  RETURN new;
END;
$$;

-- 5. Update profile protection trigger to block non-admins from changing role, membership, or member_id
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF new.role IS DISTINCT FROM old.role THEN
      RAISE EXCEPTION 'Only admins can change role';
    END IF;
    IF new.is_member IS DISTINCT FROM old.is_member
       OR new.membership_expires_at IS DISTINCT FROM old.membership_expires_at THEN
      RAISE EXCEPTION 'Only admins can change membership status';
    END IF;
    IF new.member_id IS DISTINCT FROM old.member_id THEN
      RAISE EXCEPTION 'Only admins can change Member ID';
    END IF;
  END IF;
  new.updated_at = now();
  RETURN new;
END;
$$;

-- 6. Seed default membership settings in site_content
INSERT INTO public.site_content (key, value)
VALUES (
  'membership_settings',
  '{"membership_fee": 299, "upi_id": "scienceclub@okaxis", "upi_name": "Science Club ASIET"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
