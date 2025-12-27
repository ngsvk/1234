-- Remove improper foreign key from portal_users.user_id to auth.users
ALTER TABLE public.portal_users
  DROP CONSTRAINT IF EXISTS portal_users_user_id_fkey;

-- (Optional safety) ensure user_id still always has a value when not provided
ALTER TABLE public.portal_users
  ALTER COLUMN user_id SET DEFAULT gen_random_uuid();