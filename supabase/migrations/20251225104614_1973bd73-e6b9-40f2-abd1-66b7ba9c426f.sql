-- Add optional read_more_url column to updates table for linking to detail pages or external articles
ALTER TABLE public.updates
ADD COLUMN IF NOT EXISTS read_more_url text;