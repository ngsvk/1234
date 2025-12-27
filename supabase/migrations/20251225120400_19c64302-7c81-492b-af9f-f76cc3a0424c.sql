-- Add youtube_url column to updates for storing video links separately from read-more links
ALTER TABLE public.updates
ADD COLUMN IF NOT EXISTS youtube_url text;

-- No RLS changes needed: existing policies already gate access on is_published/admin role
