-- Add login credentials fields to portal_users for custom staff/student login
ALTER TABLE public.portal_users
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('staff','student')),
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS department text;