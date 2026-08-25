-- Stage 7A.1 — AquaRise Canonical Profiles Schema & RLS Setup
-- Execute this SQL script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create public.profiles table referencing auth.users(id)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  city text,
  region text,
  country text,
  primary_waterbody text,
  bio text,
  avatar_url text,

  is_guardian boolean not null default false,
  guardian_role text,
  guardian_joined_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Policy A: Anyone can read profiles (needed for Community profile cards & public member views)
drop policy if exists "Allow public read access to profiles" on public.profiles;
create policy "Allow public read access to profiles"
  on public.profiles for select
  using (true);

-- Policy B: Authenticated user can insert ONLY their own profile
drop policy if exists "Allow user to insert own profile" on public.profiles;
create policy "Allow user to insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policy C: Authenticated user can update ONLY their own profile
drop policy if exists "Allow user to update own profile" on public.profiles;
create policy "Allow user to update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Automatic Profile Creation Trigger on auth.users Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'AquaRise Member'),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', 'AquaRise Member'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Updated At Timestamp Trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
