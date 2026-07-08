import { supabase } from '@/config/supabase';
import { censorProfanity } from '@/utils/profanityFilter';
import { ChamberType, CustomPrompt } from '@/types/game';

interface CustomPromptRow {
  id: string;
  user_id: string;
  chamber: string;
  human_prompt: string;
  alien_prompt: string;
  scenario: string | null;
  options: unknown;
  created_at: string;
}

function rowToCustomPrompt(row: CustomPromptRow): CustomPrompt {
  return {
    id: row.id,
    chamber: row.chamber as ChamberType,
    humanPrompt: row.human_prompt,
    alienPrompt: row.alien_prompt,
    scenario: row.scenario ?? undefined,
    options: Array.isArray(row.options) ? (row.options as string[]) : undefined,
  };
}

export interface NewCustomPrompt {
  chamber: ChamberType;
  humanPrompt: string;
  alienPrompt: string;
  scenario?: string;
  options?: string[];
}

/** All of the signed-in user's custom prompts (RLS scopes to them). */
export async function fetchMyCustomPrompts(): Promise<CustomPrompt[]> {
  const { data, error } = await supabase
    .from('custom_prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => rowToCustomPrompt(r as CustomPromptRow));
}

export async function addCustomPrompt(input: NewCustomPrompt): Promise<CustomPrompt> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('You must be signed in to save prompts.');

  // Keep user-generated content family-friendly (matches display-name handling).
  const clean = (s?: string) => (s ? censorProfanity(s.trim()) : s);
  const options = input.options?.map((o) => censorProfanity(o.trim())).filter((o) => o.length > 0);

  const { data, error } = await supabase
    .from('custom_prompts')
    .insert({
      user_id: userId,
      chamber: input.chamber,
      human_prompt: clean(input.humanPrompt),
      alien_prompt: clean(input.alienPrompt),
      scenario: clean(input.scenario) ?? null,
      options: options && options.length ? options : null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return rowToCustomPrompt(data as CustomPromptRow);
}

export async function deleteCustomPrompt(id: string): Promise<void> {
  const { error } = await supabase.from('custom_prompts').delete().eq('id', id);
  if (error) throw error;
}
