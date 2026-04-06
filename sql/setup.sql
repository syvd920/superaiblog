create table if not exists public.company_profiles (
  id bigint generated always as identity primary key,
  user_id uuid unique not null,
  company_name text not null default '샘플부동산',
  publish_limit integer not null default 100,
  publish_used integer not null default 0,
  image_limit integer not null default 300,
  image_used integer not null default 0,
  expires_at date not null default (current_date + 30),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.company_profiles enable row level security;

create policy if not exists "Users can view own profile"
on public.company_profiles
for select
using (auth.uid() = user_id);
