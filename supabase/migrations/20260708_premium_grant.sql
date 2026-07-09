-- Manual premium grant (comp accounts) — flip this to unlock the Expansion for
-- an account for free. The app OR's this with the RevenueCat entitlement.
--
-- Grant premium to someone from the dashboard SQL editor:
--     update public.profiles set premium_grant = true where username = 'their_name';
-- Revoke it:
--     update public.profiles set premium_grant = false where username = 'their_name';

alter table public.profiles
  add column if not exists premium_grant boolean not null default false;

-- Prevent normal users from granting themselves premium. Client requests run as
-- the `authenticated` (or `anon`) role; those are forced back to the old value.
-- Dashboard / service-role updates (auth.role() is null / 'service_role') pass
-- through, so you can still comp accounts.
create or replace function public.guard_premium_grant()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.premium_grant := false;
    elsif tg_op = 'UPDATE' and new.premium_grant is distinct from old.premium_grant then
      new.premium_grant := old.premium_grant;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_premium_grant on public.profiles;
create trigger profiles_guard_premium_grant
  before insert or update on public.profiles
  for each row execute function public.guard_premium_grant();
