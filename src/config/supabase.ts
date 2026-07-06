import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey) && !supabaseUrl.includes('your-project');

// createClient THROWS on an empty URL, which crashes the app at startup if the
// build was made without env vars (e.g. EAS without an `env` block). Fall back
// to a harmless placeholder so the app boots and can show a real error instead.
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://missing-env.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'missing-env-key';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_color: string;
          created_at: string;
        };
      };
      lobbies: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          is_public: boolean;
          status: string;
          max_players: number;
          min_players: number;
          players: unknown;
          game_id: string | null;
          created_at: string;
        };
      };
      games: {
        Row: {
          id: string;
          lobby_id: string;
          host_id: string;
          state: unknown;
          updated_at: string;
        };
      };
      matchmaking: {
        Row: {
          user_id: string;
          display_name: string;
          avatar_color: string;
          joined_at: string;
        };
      };
    };
  };
};
