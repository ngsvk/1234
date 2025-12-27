-- Add per-facility URL for "Read more" links
ALTER TABLE public.facilities
ADD COLUMN IF NOT EXISTS url text;

-- No RLS changes needed: existing policies already gate all columns via has_role(auth.uid(), 'admin').