-- Create a function to clean up auth users that don't have profiles
-- This helps when users are deleted from profiles but remain in auth.users

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_user(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user_id from auth.users by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Delete from auth.users (this will cascade to profiles if they exist)
    DELETE FROM auth.users WHERE id = target_user_id;
  END IF;
END;
$$;