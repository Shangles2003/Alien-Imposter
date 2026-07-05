-- Alien Imposter — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup (display_name from signup metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Crew Member'),
    coalesce(new.raw_user_meta_data ->> 'avatar_color', '#6366f1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Lobbies
-- ---------------------------------------------------------------------------
create table public.lobbies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null references auth.users (id) on delete cascade,
  is_public boolean not null default false,
  status text not null default 'waiting'
    check (status in ('waiting', 'starting', 'in_game', 'finished')),
  max_players integer not null default 10,
  min_players integer not null default 4,
  players jsonb not null default '[]'::jsonb,
  game_id uuid,
  host_settings jsonb not null default '{"contentPacks":["core"],"missionCount":5}'::jsonb,
  created_at timestamptz not null default now()
);

create index lobbies_code_idx on public.lobbies (code);
create index lobbies_status_idx on public.lobbies (status);

alter table public.lobbies enable row level security;

create policy "lobbies_select_authenticated"
  on public.lobbies for select
  to authenticated
  using (true);

create policy "lobbies_insert_authenticated"
  on public.lobbies for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "lobbies_update_authenticated"
  on public.lobbies for update
  to authenticated
  using (true)
  with check (true);

create policy "lobbies_delete_authenticated"
  on public.lobbies for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Games (full game state stored as JSONB)
-- ---------------------------------------------------------------------------
create table public.games (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies (id) on delete cascade,
  host_id uuid not null references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create index games_lobby_id_idx on public.games (lobby_id);

alter table public.games enable row level security;

create policy "games_select_authenticated"
  on public.games for select
  to authenticated
  using (true);

create policy "games_insert_authenticated"
  on public.games for insert
  to authenticated
  with check (true);

create policy "games_update_authenticated"
  on public.games for update
  to authenticated
  using (true)
  with check (true);

-- Link lobby → game after games table exists
alter table public.lobbies
  add constraint lobbies_game_id_fkey
  foreign key (game_id) references public.games (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Matchmaking queue
-- ---------------------------------------------------------------------------
create table public.matchmaking (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_color text not null,
  joined_at timestamptz not null default now()
);

alter table public.matchmaking enable row level security;

create policy "matchmaking_select_authenticated"
  on public.matchmaking for select
  to authenticated
  using (true);

create policy "matchmaking_insert_own"
  on public.matchmaking for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "matchmaking_delete_own"
  on public.matchmaking for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "matchmaking_update_own"
  on public.matchmaking for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Matchmaking locks (prevents double-match races)
-- ---------------------------------------------------------------------------
create table public.matchmaking_locks (
  id text primary key,
  uids text[] not null,
  created_at timestamptz not null default now()
);

alter table public.matchmaking_locks enable row level security;

create policy "matchmaking_locks_all_authenticated"
  on public.matchmaking_locks for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Realtime (required for live lobby/game updates)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.lobbies;
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.matchmaking;

-- ---------------------------------------------------------------------------
-- Optional: auto-bump updated_at on games
-- ---------------------------------------------------------------------------
create or replace function public.set_games_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_updated_at
  before update on public.games
  for each row execute function public.set_games_updated_at();

-- ---------------------------------------------------------------------------
-- Migration: host settings on lobbies (run if table already exists)
-- ---------------------------------------------------------------------------
alter table public.lobbies
  add column if not exists host_settings jsonb not null
  default '{"contentPacks":["core"],"missionCount":5}'::jsonb;
