-- Add calendar fields to academics_content for academic calendar management
ALTER TABLE public.academics_content
ADD COLUMN IF NOT EXISTS calendar_title text,
ADD COLUMN IF NOT EXISTS calendar_events jsonb;