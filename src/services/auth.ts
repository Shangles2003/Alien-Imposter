import { User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { PlayerProfile } from '@/types/game';
import { pickAvatarColor } from '@/game/rules';
import { normalizeUsername, usernameToAuthEmail, validateUsername } from '@/utils/username';

function rowToProfile(row: {
  id: string;
  display_name: string;
  username: string | null;
  avatar_color: string;
  created_at: string;
}): PlayerProfile {
  return {
    uid: row.id,
    username: row.username ?? undefined,
    displayName: row.display_name,
    avatarColor: row.avatar_color,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  const validationError = validateUsername(normalized);
  if (validationError) return false;

  const { data, error } = await supabase.rpc('is_username_available', {
    p_username: normalized,
  });

  if (error) throw error;
  return Boolean(data);
}

export async function signUp(username: string, password: string): Promise<User> {
  const trimmed = username.trim();
  const normalized = normalizeUsername(trimmed);
  const validationError = validateUsername(trimmed);
  if (validationError) throw new Error(validationError);

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const available = await isUsernameAvailable(normalized);
  if (!available) {
    throw new Error('That username is already taken. Try another.');
  }

  const avatarColor = pickAvatarColor(Math.floor(Math.random() * 10));
  const authEmail = usernameToAuthEmail(normalized);

  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        username: normalized,
        display_name: trimmed,
        avatar_color: avatarColor,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Signup failed — no user returned.');

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    display_name: trimmed,
    username: normalized,
    avatar_color: avatarColor,
  });

  if (profileError) {
    if (profileError.code === '23505') {
      throw new Error('That username is already taken. Try another.');
    }
    throw profileError;
  }

  return data.user;
}

export async function signIn(username: string, password: string): Promise<User> {
  const trimmed = username.trim();
  const validationError = validateUsername(trimmed);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToAuthEmail(trimmed),
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error('Wrong username or password.');
    }
    throw error;
  }

  if (!data.user) throw new Error('Login failed — no user returned.');
  return data.user;
}

export async function logOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

export async function getProfile(uid: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToProfile(data);
}

export async function updateDisplayName(uid: string, displayName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', uid);

  if (error) throw error;
}

/**
 * Permanently deletes the signed-in user's account (App Store requirement).
 * Calls the `delete_account` SECURITY DEFINER function in Postgres, which
 * removes the auth user — profiles/lobbies/games cascade from there.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_account');
  if (error) throw error;
  await supabase.auth.signOut();
}
