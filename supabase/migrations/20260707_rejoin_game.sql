-- Allow crew to rejoin an in-progress game via lobby code
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
  v_display text;
  v_color text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  v_display := coalesce(nullif(trim(p_display_name), ''), 'Crew');
  v_color := coalesce(nullif(trim(p_avatar_color), ''), '#6366f1');

  select * into v_lobby
  from public.lobbies
  where code = upper(trim(p_code))
  limit 1;

  if v_lobby.id is null then
    raise exception 'Lobby not found. Check the code and try again.';
  end if;

  if v_lobby.status = 'finished' then
    raise exception 'This mission has ended.';
  end if;

  v_players := coalesce(v_lobby.players, '[]'::jsonb);

  -- Rejoin a running game (must already be on the mission roster)
  if v_lobby.status = 'in_game' then
    if v_lobby.game_id is null then
      raise exception 'Game not found for this lobby.';
    end if;

    if not exists (
      select 1
      from public.games g,
           jsonb_array_elements(g.state -> 'players') elem
      where g.id = v_lobby.game_id
        and elem ->> 'uid' = auth.uid()::text
    ) then
      raise exception 'This game is already in progress. Only original crew can rejoin.';
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_players) elem
      where elem ->> 'uid' = auth.uid()::text
    ) then
      return v_lobby;
    end if;

    v_now_ms := (extract(epoch from now()) * 1000)::bigint;

    v_players := v_players || jsonb_build_array(
      jsonb_build_object(
        'uid', auth.uid(),
        'displayName', v_display,
        'avatarColor', v_color,
        'isHost', false,
        'isReady', true,
        'joinedAt', v_now_ms
      )
    );

    update public.lobbies
    set players = v_players
    where id = v_lobby.id
    returning * into v_lobby;

    return v_lobby;
  end if;

  if v_lobby.status <> 'waiting' then
    raise exception 'This lobby is no longer accepting players.';
  end if;

  if jsonb_array_length(v_players) >= v_lobby.max_players then
    raise exception 'Lobby is full.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_players) elem
    where elem ->> 'uid' = auth.uid()::text
  ) then
    return v_lobby;
  end if;

  for v_member_uid in
    select elem ->> 'uid'
    from jsonb_array_elements(v_players) elem
    where elem ->> 'uid' is not null
      and elem ->> 'uid' not like 'dev-bot-%'
  loop
    if public.users_are_blocked(auth.uid(), v_member_uid::uuid) then
      raise exception 'Cannot join: a blocked player is in this lobby.';
    end if;
  end loop;

  v_now_ms := (extract(epoch from now()) * 1000)::bigint;

  v_players := v_players || jsonb_build_array(
    jsonb_build_object(
      'uid', auth.uid(),
      'displayName', v_display,
      'avatarColor', v_color,
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

revoke execute on function public.join_lobby_by_code(text, text, text) from public;
grant execute on function public.join_lobby_by_code(text, text, text) to authenticated;
