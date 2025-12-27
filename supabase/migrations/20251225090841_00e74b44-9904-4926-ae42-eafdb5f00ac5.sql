-- Staff directory table
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  designation text not null,
  department text,
  email text not null,
  phone text,
  qualifications text,
  photo_url text,
  staff_type text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  experience_years integer,
  joining_date date
);

alter table public.staff enable row level security;

-- Public site can read staff directory
create policy "Public read staff"
  on public.staff
  for select
  using (true);

-- Only admins can manage staff records
create policy "Admins manage staff"
  on public.staff
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
