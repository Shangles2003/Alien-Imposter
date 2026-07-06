-- User blocks & reports (UGC moderation)
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Tables
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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Block / unblock
-- ---------------------------------------------------------------------------
create or replace function public.block_user(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;
  if p_target_id = auth.uid() then
    raise exception 'You cannot block yourself.';
  end if;
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
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;
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
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;
  select id into v_target_id
  from public.profiles
  where username is not null
    and lower(username) = lower(trim(p_username))
  limit 1;
  if v_target_id is null then
    raise exception 'User not found.';
  end if;
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

-- ---------------------------------------------------------------------------
-- Report
-- ---------------------------------------------------------------------------
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
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;
  if p_target_id = auth.uid() then
    raise exception 'You cannot report yourself.';
  end if;
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

-- ---------------------------------------------------------------------------
-- Join lobby (server-enforced block check)
-- ---------------------------------------------------------------------------
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
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

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

  -- Already in lobby — return as-is
  if exists (
    select 1
    from jsonb_array_elements(v_players) elem
    where elem->>'uid' = auth.uid()::text
  ) then
    return v_lobby;
  end if;

  -- Block check against human players (skip dev bots)
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

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
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
