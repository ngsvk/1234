-- Comprehensive content management for all pages

-- 1) About page content
CREATE TABLE IF NOT EXISTS public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text,
  hero_description text,
  hero_image_url text,
  mission_title text,
  mission_description text,
  vision_title text,
  vision_description text,
  values_title text,
  values_description text,
  history_title text,
  history_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage about content" ON public.about_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "About content is viewable by everyone" ON public.about_content
  FOR SELECT USING (true);

-- 2) Academics page content
CREATE TABLE IF NOT EXISTS public.academics_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text,
  hero_description text,
  programs_title text,
  programs_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.academics_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage academics content" ON public.academics_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Academics content is viewable by everyone" ON public.academics_content
  FOR SELECT USING (true);

-- 3) Academic programs
CREATE TABLE IF NOT EXISTS public.academic_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage programs" ON public.academic_programs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Programs are viewable by everyone" ON public.academic_programs
  FOR SELECT USING (true);

-- 4) Campus Life content
CREATE TABLE IF NOT EXISTS public.campus_life_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text,
  hero_description text,
  activities_title text,
  activities_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campus_life_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campus life content" ON public.campus_life_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Campus life content is viewable by everyone" ON public.campus_life_content
  FOR SELECT USING (true);

-- 5) Campus activities/events
CREATE TABLE IF NOT EXISTS public.campus_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  category text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campus_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage activities" ON public.campus_activities
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Activities are viewable by everyone" ON public.campus_activities
  FOR SELECT USING (true);

-- 6) Gallery images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  category text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gallery" ON public.gallery_images
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Gallery is viewable by everyone" ON public.gallery_images
  FOR SELECT USING (true);

-- 7) Facilities (editable version of home facilities)
CREATE TABLE IF NOT EXISTS public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage facilities" ON public.facilities
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Facilities are viewable by everyone" ON public.facilities
  FOR SELECT USING (true);

-- 8) Footer content
CREATE TABLE IF NOT EXISTS public.footer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  about_text text,
  contact_email text,
  contact_phone text,
  contact_address text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  youtube_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage footer" ON public.footer_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Footer is viewable by everyone" ON public.footer_content
  FOR SELECT USING (true);

-- Add triggers for updated_at
CREATE TRIGGER set_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_academics_content_updated_at
  BEFORE UPDATE ON public.academics_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_academic_programs_updated_at
  BEFORE UPDATE ON public.academic_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_campus_life_content_updated_at
  BEFORE UPDATE ON public.campus_life_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_campus_activities_updated_at
  BEFORE UPDATE ON public.campus_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_footer_content_updated_at
  BEFORE UPDATE ON public.footer_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data
INSERT INTO public.about_content (hero_title, hero_description, mission_title, mission_description)
SELECT 'About Us',
       'Learn about our history, mission, and values that guide our institution.',
       'Our Mission',
       'To provide quality education rooted in human values and academic excellence.'
WHERE NOT EXISTS (SELECT 1 FROM public.about_content);

INSERT INTO public.academics_content (hero_title, hero_description, programs_title, programs_description)
SELECT 'Academics',
       'Explore our comprehensive academic programs designed for your success.',
       'Our Programs',
       'We offer a wide range of programs to meet diverse student needs.'
WHERE NOT EXISTS (SELECT 1 FROM public.academics_content);

INSERT INTO public.campus_life_content (hero_title, hero_description, activities_title, activities_description)
SELECT 'Campus Life',
       'Experience the vibrant and diverse community at SSSBPUC.',
       'Activities & Events',
       'Discover the many ways to get involved on campus.'
WHERE NOT EXISTS (SELECT 1 FROM public.campus_life_content);

INSERT INTO public.footer_content (about_text, contact_email, contact_phone, contact_address)
SELECT 'Sri Sathya Sai School & PU College Mysuru is dedicated to fostering Education in Human Values.',
       'contact@sssbpuc.edu',
       '+91 1234567890',
       'Mysuru, Karnataka, India'
WHERE NOT EXISTS (SELECT 1 FROM public.footer_content);

-- Seed sample facilities
INSERT INTO public.facilities (name, description, icon, image_url, display_order)
SELECT * FROM (VALUES
  ('Physics Lab', 'Equipped with advanced apparatus for hands-on experiments.', '⚛️', 'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4033.jpg?raw=true', 0),
  ('Chemistry Lab', 'Designed for safe and effective chemical experiments.', '🧪', 'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4038.jpg?raw=true', 1),
  ('Biology Lab', 'Modern tools for studying life sciences.', '🌱', 'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4015.jpg?raw=true', 2),
  ('Computer Lab', 'State-of-the-art computers for practical learning.', '💻', 'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4006.jpg?raw=true', 3),
  ('Library', 'Extensive collection of books and digital resources.', '📚', 'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4054.jpg?raw=true', 4),
  ('Classrooms', 'Well-ventilated and spacious learning spaces.', '👨‍🏫', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 5)
) AS v(name, description, icon, image_url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.facilities);
