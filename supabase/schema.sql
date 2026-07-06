-- Alien Imposter — Supabase schema
-- Safe to re-run on an existing project (uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  username text,
  avatar_color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup (username + display_name from signup metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_display text;
begin
  v_username := nullif(lower(trim(coalesce(new.raw_user_meta_data ->> 'username', ''))), '');
  v_display := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    v_username,
    'Crew Member'
  );

  insert into public.profiles (id, display_name, username, avatar_color)
  values (
    new.id,
    v_display,
    v_username,
    coalesce(new.raw_user_meta_data ->> 'avatar_color', '#6366f1')
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    username = coalesce(excluded.username, public.profiles.username),
    avatar_color = excluded.avatar_color;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Lobbies
-- ---------------------------------------------------------------------------
create table if not exists public.lobbies (
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

alter table public.lobbies
  add column if not exists host_settings jsonb not null
  default '{"contentPacks":["core"],"missionCount":5}'::jsonb;

create index if not exists lobbies_code_idx on public.lobbies (code);
create index if not exists lobbies_status_idx on public.lobbies (status);

alter table public.lobbies enable row level security;

drop policy if exists "lobbies_select_authenticated" on public.lobbies;
create policy "lobbies_select_authenticated"
  on public.lobbies for select
  to authenticated
  using (true);

drop policy if exists "lobbies_insert_authenticated" on public.lobbies;
create policy "lobbies_insert_authenticated"
  on public.lobbies for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "lobbies_update_authenticated" on public.lobbies;
create policy "lobbies_update_authenticated"
  on public.lobbies for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lobbies_delete_authenticated" on public.lobbies;
create policy "lobbies_delete_authenticated"
  on public.lobbies for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Games (full game state stored as JSONB)
-- ---------------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies (id) on delete cascade,
  host_id uuid not null references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists games_lobby_id_idx on public.games (lobby_id);

alter table public.games enable row level security;

drop policy if exists "games_select_authenticated" on public.games;
create policy "games_select_authenticated"
  on public.games for select
  to authenticated
  using (true);

drop policy if exists "games_insert_authenticated" on public.games;
create policy "games_insert_authenticated"
  on public.games for insert
  to authenticated
  with check (true);

drop policy if exists "games_update_authenticated" on public.games;
create policy "games_update_authenticated"
  on public.games for update
  to authenticated
  using (true)
  with check (true);

-- Link lobby → game (skip if already linked)
do $$
begin
  alter table public.lobbies
    add constraint lobbies_game_id_fkey
    foreign key (game_id) references public.games (id) on delete set null;
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Matchmaking queue
-- ---------------------------------------------------------------------------
create table if not exists public.matchmaking (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_color text not null,
  joined_at timestamptz not null default now()
);

alter table public.matchmaking enable row level security;

drop policy if exists "matchmaking_select_authenticated" on public.matchmaking;
create policy "matchmaking_select_authenticated"
  on public.matchmaking for select
  to authenticated
  using (true);

drop policy if exists "matchmaking_insert_own" on public.matchmaking;
create policy "matchmaking_insert_own"
  on public.matchmaking for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "matchmaking_delete_own" on public.matchmaking;
create policy "matchmaking_delete_own"
  on public.matchmaking for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "matchmaking_update_own" on public.matchmaking;
create policy "matchmaking_update_own"
  on public.matchmaking for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Matchmaking locks (prevents double-match races)
-- ---------------------------------------------------------------------------
create table if not exists public.matchmaking_locks (
  id text primary key,
  uids text[] not null,
  created_at timestamptz not null default now()
);

alter table public.matchmaking_locks enable row level security;

drop policy if exists "matchmaking_locks_all_authenticated" on public.matchmaking_locks;
create policy "matchmaking_locks_all_authenticated"
  on public.matchmaking_locks for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Realtime (required for live lobby/game updates)
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.lobbies;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.games;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.matchmaking;
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Auto-bump updated_at on games
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

drop trigger if exists games_updated_at on public.games;
create trigger games_updated_at
  before update on public.games
  for each row execute function public.set_games_updated_at();

-- ---------------------------------------------------------------------------
-- Username availability (case-insensitive unique usernames)
-- ---------------------------------------------------------------------------
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username is not null
      and lower(username) = lower(trim(p_username))
  );
$$;

revoke execute on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Account deletion (App Store 5.1.1(v) — Settings → Delete Account)
-- ---------------------------------------------------------------------------
create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- ---------------------------------------------------------------------------
-- User blocks & reports (UGC moderation)
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_no_self check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocked_id_idx on public.user_blocks (blocked_id);

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (
    reason in ('harassment', 'hate_speech', 'inappropriate_content', 'spam', 'other')
  ),
  details text,
  context text,
  created_at timestamptz not null default now(),
  constraint user_reports_no_self check (reporter_id <> reported_id)
);

create index if not exists user_reports_reported_id_idx on public.user_reports (reported_id);
create index if not exists user_reports_created_at_idx on public.user_reports (created_at desc);

alter table public.user_blocks enable row level security;
alter table public.user_reports enable row level security;

drop policy if exists "user_blocks_select_own" on public.user_blocks;
create policy "user_blocks_select_own"
  on public.user_blocks for select
  to authenticated
  using (blocker_id = auth.uid());

drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own"
  on public.user_blocks for delete
  to authenticated
  using (blocker_id = auth.uid());

drop policy if exists "user_reports_insert_own" on public.user_reports;
create policy "user_reports_insert_own"
  on public.user_reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create or replace function public.users_are_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks ub
    where (ub.blocker_id = a and ub.blocked_id = b)
       or (ub.blocker_id = b and ub.blocked_id = a)
  );
$$;

revoke execute on function public.users_are_blocked(uuid, uuid) from public;
grant execute on function public.users_are_blocked(uuid, uuid) to authenticated;

create or replace function public.block_user(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated.'; end if;
  if p_target_id = auth.uid() then raise exception 'You cannot block yourself.'; end if;
  if not exists (select 1 from auth.users where id = p_target_id) then
    raise exception 'User not found.';
  end if;
  insert into public.user_blocks (blocker_id, blocked_id)
  values (auth.uid(), p_target_id)
  on conflict (blocker_id, blocked_id) do nothing;
end;
$$;

create or replace function public.unblock_user(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated.'; end if;
  delete from public.user_blocks
  where blocker_id = auth.uid() and blocked_id = p_target_id;
end;
$$;

create or replace function public.block_user_by_username(p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated.'; end if;
  select id into v_target_id
  from public.profiles
  where username is not null
    and lower(username) = lower(trim(p_username))
  limit 1;
  if v_target_id is null then raise exception 'User not found.'; end if;
  perform public.block_user(v_target_id);
end;
$$;

create or replace function public.list_my_blocks()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    json_agg(
      json_build_object(
        'blocked_id', ub.blocked_id,
        'username', p.username,
        'display_name', p.display_name,
        'avatar_color', p.avatar_color,
        'blocked_at', ub.created_at
      )
      order by ub.created_at desc
    ),
    '[]'::json
  )
  from public.user_blocks ub
  join public.profiles p on p.id = ub.blocked_id
  where ub.blocker_id = auth.uid();
$$;

create or replace function public.report_user(
  p_target_id uuid,
  p_reason text,
  p_details text default null,
  p_context text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated.'; end if;
  if p_target_id = auth.uid() then raise exception 'You cannot report yourself.'; end if;
  if p_reason not in ('harassment', 'hate_speech', 'inappropriate_content', 'spam', 'other') then
    raise exception 'Invalid report reason.';
  end if;
  if not exists (select 1 from auth.users where id = p_target_id) then
    raise exception 'User not found.';
  end if;
  insert into public.user_reports (reporter_id, reported_id, reason, details, context)
  values (
    auth.uid(),
    p_target_id,
    p_reason,
    nullif(trim(coalesce(p_details, '')), ''),
    nullif(trim(coalesce(p_context, '')), '')
  );
end;
$$;

create or replace function public.join_lobby_by_code(
  p_code text,
  p_display_name text,
  p_avatar_color text
)
returns public.lobbies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lobby public.lobbies;
  v_players jsonb;
  v_member_uid text;
  v_now_ms bigint;
begin
  if auth.uid() is null then raise exception 'Not authenticated.'; end if;

  select * into v_lobby
  from public.lobbies
  where code = upper(trim(p_code))
  limit 1;

  if v_lobby.id is null then
    raise exception 'Lobby not found. Check the code and try again.';
  end if;

  if v_lobby.status <> 'waiting' then
    raise exception 'This lobby is no longer accepting players.';
  end if;

  v_players := coalesce(v_lobby.players, '[]'::jsonb);

  if jsonb_array_length(v_players) >= v_lobby.max_players then
    raise exception 'Lobby is full.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_players) elem
    where elem->>'uid' = auth.uid()::text
  ) then
    return v_lobby;
  end if;

  for v_member_uid in
    select elem->>'uid'
    from jsonb_array_elements(v_players) elem
    where elem->>'uid' is not null
      and elem->>'uid' not like 'dev-bot-%'
  loop
    if public.users_are_blocked(auth.uid(), v_member_uid::uuid) then
      raise exception 'Cannot join: a blocked player is in this lobby.';
    end if;
  end loop;

  v_now_ms := (extract(epoch from now()) * 1000)::bigint;

  v_players := v_players || jsonb_build_array(
    jsonb_build_object(
      'uid', auth.uid(),
      'displayName', coalesce(nullif(trim(p_display_name), ''), 'Crew'),
      'avatarColor', coalesce(nullif(trim(p_avatar_color), ''), '#6366f1'),
      'isHost', false,
      'isReady', false,
      'joinedAt', v_now_ms
    )
  );

  update public.lobbies
  set players = v_players
  where id = v_lobby.id
  returning * into v_lobby;

  return v_lobby;
end;
$$;

revoke execute on function public.block_user(uuid) from public;
grant execute on function public.block_user(uuid) to authenticated;

revoke execute on function public.unblock_user(uuid) from public;
grant execute on function public.unblock_user(uuid) to authenticated;

revoke execute on function public.block_user_by_username(text) from public;
grant execute on function public.block_user_by_username(text) to authenticated;

revoke execute on function public.list_my_blocks() from public;
grant execute on function public.list_my_blocks() to authenticated;

revoke execute on function public.report_user(uuid, text, text, text) from public;
grant execute on function public.report_user(uuid, text, text, text) to authenticated;

revoke execute on function public.join_lobby_by_code(text, text, text) from public;
grant execute on function public.join_lobby_by_code(text, text, text) to authenticated;
