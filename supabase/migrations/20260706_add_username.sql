-- Add unique usernames for username/password auth (run in Supabase SQL Editor)

alter table public.profiles
  add column if not exists username text;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

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
