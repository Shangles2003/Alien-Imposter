-- Custom prompt decks for premium hosts.
--
-- One personal deck per user for now: every row a user owns *is* their deck.
-- Row-level security scopes all access to the owner. Only the host reads their
-- own rows (at game launch they're baked into the shared game state), so other
-- players never query this table directly.

create table if not exists public.custom_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Chamber / task type: opinion_hold | deliberation_deck | drawing_quarters
  --                      | writing_pod | most_likely_to
  chamber text not null,
  human_prompt text not null,
  alien_prompt text not null,
  -- Deliberation only:
  scenario text,
  options jsonb,
  created_at timestamptz not null default now()
);

create index if not exists custom_prompts_user_idx on public.custom_prompts (user_id);

alter table public.custom_prompts enable row level security;

drop policy if exists "custom_prompts_select_own" on public.custom_prompts;
create policy "custom_prompts_select_own"
  on public.custom_prompts for select
  using (auth.uid() = user_id);

drop policy if exists "custom_prompts_insert_own" on public.custom_prompts;
create policy "custom_prompts_insert_own"
  on public.custom_prompts for insert
  with check (auth.uid() = user_id);

drop policy if exists "custom_prompts_update_own" on public.custom_prompts;
create policy "custom_prompts_update_own"
  on public.custom_prompts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "custom_prompts_delete_own" on public.custom_prompts;
create policy "custom_prompts_delete_own"
  on public.custom_prompts for delete
  using (auth.uid() = user_id);
