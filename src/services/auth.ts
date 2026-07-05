import { User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { PlayerProfile } from '@/types/game';
import { pickAvatarColor } from '@/game/rules';

function rowToProfile(row: {
  id: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
}): PlayerProfile {
  return {
    uid: row.id,
    displayName: row.display_name,
    avatarColor: row.avatar_color,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const avatarColor = pickAvatarColor(Math.floor(Math.random() * 10));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        avatar_color: avatarColor,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Signup failed — no user returned.');

  await supabase.from('profiles').upsert({
    id: data.user.id,
    display_name: displayName,
    avatar_color: avatarColor,
  });

  return data.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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
