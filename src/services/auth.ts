import * as AppleAuthentication from 'expo-apple-authentication';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { PlayerProfile } from '@/types/game';
import { pickAvatarColor } from '@/game/rules';
import { censorProfanity, wasProfanityCensored } from '@/utils/profanityFilter';
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

  if (wasProfanityCensored(trimmed, censorProfanity(trimmed))) {
    throw new Error('Username contains inappropriate language. Please choose another.');
  }

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

/**
 * Sign in / up with Apple. Ties the account to the user's Apple ID — no email
 * confirmation, no password to forget, and it restores on any device with the
 * same Apple ID. A DB trigger creates the profile ("Crew Member" default); on
 * the FIRST authorization Apple gives us the person's name, which we use as a
 * nicer callsign (they can change it in Settings). Apple omits the name on later
 * sign-ins, so that upgrade only runs once and never overwrites a custom name.
 */
export async function signInWithApple(): Promise<User> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple sign-in failed — no identity token returned.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error('Apple sign-in failed — no user returned.');

  const given = credential.fullName?.givenName?.trim();
  if (given) {
    const callsign = censorProfanity(given).slice(0, 24);
    await supabase
      .from('profiles')
      .update({ display_name: callsign })
      .eq('id', user.id)
      .eq('display_name', 'Crew Member');
  }

  return user;
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
  const trimmed = censorProfanity(displayName.trim());

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed })
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
