-- Allow admins to view all user roles so Admin Access UI can reflect correct status
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));
