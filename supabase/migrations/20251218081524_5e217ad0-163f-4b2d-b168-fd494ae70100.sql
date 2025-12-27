-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  qualifications TEXT,
  experience_years INTEGER,
  joining_date DATE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Staff policies
CREATE POLICY "Staff are viewable by everyone"
  ON public.staff FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage staff"
  ON public.staff FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create admission_rate_limits table
CREATE TABLE public.admission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL,
  stream TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  filled_seats INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (academic_year, stream)
);

-- Enable RLS on admission_rate_limits
ALTER TABLE public.admission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Admission rate limits policies
CREATE POLICY "Admission rate limits are viewable by everyone"
  ON public.admission_rate_limits FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage admission rate limits"
  ON public.admission_rate_limits FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create admission_submissions table
CREATE TABLE public.admission_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  stream TEXT NOT NULL,
  previous_school TEXT NOT NULL,
  marks_percentage DECIMAL(5,2) NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT,
  documents JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admission_submissions
ALTER TABLE public.admission_submissions ENABLE ROW LEVEL SECURITY;

-- Admission submissions policies
CREATE POLICY "Users can view their own submissions"
  ON public.admission_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create admission submission"
  ON public.admission_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON public.admission_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.admission_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create portal_users table
CREATE TABLE public.portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  student_id TEXT UNIQUE,
  roll_number TEXT,
  class TEXT,
  section TEXT,
  admission_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on portal_users
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;

-- Portal users policies
CREATE POLICY "Users can view their own portal data"
  ON public.portal_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage portal users"
  ON public.portal_users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updates table with video support
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Research', 'Events', 'Campus Life', 'Academics', 'Announcements')),
  video_url TEXT,
  thumbnail_url TEXT,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on updates
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Updates policies
CREATE POLICY "Published updates are viewable by everyone"
  ON public.updates FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all updates"
  ON public.updates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage updates"
  ON public.updates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admission_rate_limits_updated_at
  BEFORE UPDATE ON public.admission_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_users_updated_at
  BEFORE UPDATE ON public.portal_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_updates_updated_at
  BEFORE UPDATE ON public.updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Create storage policies for videos bucket
CREATE POLICY "Videos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Admins can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- Create storage policies for thumbnails bucket
CREATE POLICY "Thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Admins can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'thumbnails' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thumbnails' AND
    public.has_role(auth.uid(), 'admin')
  );