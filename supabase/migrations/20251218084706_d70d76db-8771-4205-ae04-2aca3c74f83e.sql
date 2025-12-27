-- Phase 1: content management tables for navbar + home page

-- 1) Navbar items table
CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  path text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

-- Admins can manage nav items
CREATE POLICY "Admins can manage nav items" ON public.nav_items
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Everyone can read nav items
CREATE POLICY "Nav items are viewable by everyone" ON public.nav_items
  FOR SELECT
  USING (true);

-- 2) Home page content (single-row table)
CREATE TABLE IF NOT EXISTS public.home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_video_enabled boolean NOT NULL DEFAULT false,
  hero_video_id text,
  about_description text,
  founder_name text,
  founder_description text,
  founder_image_url text,
  blessings_name text,
  blessings_description text,
  blessings_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage home content" ON public.home_content
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Home content is viewable by everyone" ON public.home_content
  FOR SELECT
  USING (true);

-- 3) Updated trigger for updated_at (re-use existing function)
CREATE TRIGGER set_nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_home_content_updated_at
  BEFORE UPDATE ON public.home_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Seed initial navbar + home row if empty
INSERT INTO public.nav_items (label, path, display_order, is_visible)
SELECT * FROM (VALUES
  ('Home', '/', 0, true),
  ('About', '/about', 1, true),
  ('Academics', '/academics', 2, true),
  ('Campus Life', '/campus-life', 3, true),
  ('Gallery', '/gallery', 4, true),
  ('Admission', '/admission', 5, true),
  ('Staff', '/staff', 6, true),
  ('Portal', '/portal', 7, true)
) AS v(label, path, display_order, is_visible)
WHERE NOT EXISTS (SELECT 1 FROM public.nav_items);

INSERT INTO public.home_content (hero_video_enabled, hero_video_id, about_description, founder_name, founder_description, founder_image_url, blessings_name, blessings_description, blessings_image_url)
SELECT true,
       'VIDEO_ID_PLACEHOLDER',
       'Our school is dedicated to fostering Education in Human Values. Today''s education system often prioritizes intellectual and skill development while neglecting the cultivation of good character. We believe that true education extends beyond academics to encompass moral and spiritual growth. Our mission is to nurture students who not only excel academically but also possess compassion, humility, and a sense of service towards society.',
       'Late Smt Sunandamma',
       'Deeply influenced by Bhagawan Sri Sathya Sai Baba, Smt Sunandamma, with the help of some dedicated workers, set up this educational institution at Mysuru in 1957.',
       'https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Sunandamma.png?raw=true',
       'Bhagawan Sri Sathya Sai Baba',
       'Bhagawan Sri Sathya Sai Baba was incarnated in a remote village called Puttaparthi in Anantpur district in Andhra Pradesh in the year 23-11-1926.',
       'https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Baba%20Cahir.jpg?raw=true'
WHERE NOT EXISTS (SELECT 1 FROM public.home_content);
