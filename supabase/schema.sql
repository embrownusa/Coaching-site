-- Last Mile Endurance: client area database.
-- Run once in Supabase: SQL Editor > New query > paste this file > Run.
--
-- Clients sign in by email link and can only ever see their own rows.
-- Coaches (profiles.role = 'coach') can see and edit everything.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role text not null default 'client' check (role in ('client', 'coach')),
  coach_name text,
  plan_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.profiles on delete cascade,
  day date not null,
  title text not null,
  detail text,
  completed boolean not null default false,
  feel text,
  created_at timestamptz not null default now()
);
create index if not exists sessions_client_day on public.sessions (client_id, day);

create table if not exists public.checkins (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.profiles on delete cascade,
  starts_at timestamptz not null,
  duration_min int not null default 30,
  kind text not null default 'Video call',
  link text
);

create table if not exists public.coach_notes (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.profiles on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Is the signed-in person a coach?
create or replace function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'coach');
$$;

-- Create a profile automatically when someone signs in for the first time.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.checkins enable row level security;
alter table public.coach_notes enable row level security;

-- Profiles: read your own; coaches read and edit all.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_coach());
drop policy if exists "coach edits profiles" on public.profiles;
create policy "coach edits profiles" on public.profiles for update using (public.is_coach());

-- Sessions: clients read theirs and can tick them off; coaches do anything.
drop policy if exists "read own sessions" on public.sessions;
create policy "read own sessions" on public.sessions for select using (client_id = auth.uid() or public.is_coach());
drop policy if exists "update own sessions" on public.sessions;
create policy "update own sessions" on public.sessions for update using (client_id = auth.uid() or public.is_coach());
drop policy if exists "coach writes sessions" on public.sessions;
create policy "coach writes sessions" on public.sessions for insert with check (public.is_coach());
drop policy if exists "coach deletes sessions" on public.sessions;
create policy "coach deletes sessions" on public.sessions for delete using (public.is_coach());

-- Clients may only change whether a session is done and how it felt.
revoke update on public.sessions from authenticated;
grant update (completed, feel) on public.sessions to authenticated;

-- Check-ins and coach notes: clients read theirs; coaches do anything.
drop policy if exists "read own checkins" on public.checkins;
create policy "read own checkins" on public.checkins for select using (client_id = auth.uid() or public.is_coach());
drop policy if exists "coach writes checkins" on public.checkins;
create policy "coach writes checkins" on public.checkins for all using (public.is_coach()) with check (public.is_coach());

drop policy if exists "read own notes" on public.coach_notes;
create policy "read own notes" on public.coach_notes for select using (client_id = auth.uid() or public.is_coach());
drop policy if exists "coach writes notes" on public.coach_notes;
create policy "coach writes notes" on public.coach_notes for all using (public.is_coach()) with check (public.is_coach());
