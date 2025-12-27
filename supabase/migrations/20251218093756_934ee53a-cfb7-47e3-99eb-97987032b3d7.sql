-- Revisions table for content sections
CREATE TABLE IF NOT EXISTS public.site_content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view content revisions"
ON public.site_content_revisions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can add content revisions"
ON public.site_content_revisions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_site_content_revisions_updated_at'
  ) THEN
    CREATE TRIGGER update_site_content_revisions_updated_at
    BEFORE UPDATE ON public.site_content_revisions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;