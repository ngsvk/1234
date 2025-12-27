-- Create roles enum (fresh project, so no IF NOT EXISTS needed)
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Function to safely check roles
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Basic policy: users can read their own roles
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);


-- Content storage for editable site sections
create table public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.site_content_revisions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.site_content_revisions enable row level security;

-- Public can read content
create policy "Public can read site content"
  on public.site_content
  for select
  using (true);

create policy "Public can read site content revisions"
  on public.site_content_revisions
  for select
  using (true);

-- Only admins can modify content
create policy "Admins manage site content"
  on public.site_content
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage site content revisions"
  on public.site_content_revisions
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Admission form submissions
create table public.admission_submissions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  date_of_birth text not null,
  gender text not null,
  contact_number text not null,
  email text not null,
  address text not null,
  parent_name text not null,
  parent_contact text not null,
  stream text not null,
  previous_school text,
  sslc_result text,
  preferred_language text,
  status text,
  submitted_at timestamptz not null default now()
);

alter table public.admission_submissions enable row level security;

-- Anyone (including anonymous) can submit an admission form
create policy "Anyone can submit admissions"
  on public.admission_submissions
  for insert
  with check (true);

-- Only admins can read / update / delete submissions
create policy "Admins manage admissions"
  on public.admission_submissions
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Academics content and programs
create table public.academics_content (
  id uuid primary key default gen_random_uuid(),
  hero_title text,
  hero_description text,
  calendar_title text,
  calendar_events jsonb default '[]'::jsonb
);

create table public.academic_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  subjects jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb
);

alter table public.academics_content enable row level security;
alter table public.academic_programs enable row level security;

create policy "Public read academics content"
  on public.academics_content
  for select
  using (true);

create policy "Public read academic programs"
  on public.academic_programs
  for select
  using (true);

create policy "Admins manage academics content"
  on public.academics_content
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage academic programs"
  on public.academic_programs
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Facilities used on Campus Life page
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  is_visible boolean not null default true,
  display_order integer not null default 0
);

alter table public.facilities enable row level security;

create policy "Public read facilities"
  on public.facilities
  for select
  using (true);

create policy "Admins manage facilities"
  on public.facilities
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Gallery images
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  description text,
  category text,
  is_visible boolean not null default true,
  display_order integer not null default 0
);

alter table public.gallery_images enable row level security;

create policy "Public read gallery images"
  on public.gallery_images
  for select
  using (true);

create policy "Admins manage gallery images"
  on public.gallery_images
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Timetable entries for student portal
create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  class text not null,
  section text not null,
  day_of_week text not null,
  start_time text not null,
  end_time text,
  subject text not null,
  teacher text,
  room text
);

alter table public.timetable_entries enable row level security;

create policy "Public read timetable entries"
  on public.timetable_entries
  for select
  using (true);

create policy "Admins manage timetable entries"
  on public.timetable_entries
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Updates / notices table
create table public.updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null default current_date,
  is_published boolean not null default false
);

alter table public.updates enable row level security;

create policy "Public read published updates"
  on public.updates
  for select
  using (is_published = true);

create policy "Admins manage updates"
  on public.updates
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- Portal users for staff and students
create table public.portal_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  username text not null unique,
  password_hash text,
  user_type text not null check (user_type in ('staff', 'student')),
  full_name text not null,
  email text,
  department text,
  class text,
  section text,
  roll_number text,
  admission_date date,
  is_active boolean not null default true
);

alter table public.portal_users enable row level security;

-- Only admins can manage portal users via the admin UI
create policy "Admins manage portal users"
  on public.portal_users
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
