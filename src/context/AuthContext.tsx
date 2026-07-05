import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getProfile, subscribeToAuth } from '@/services/auth';
import { PlayerProfile } from '@/types/game';

interface AuthContextValue {
  user: User | null;
  profile: PlayerProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    const p = await getProfile(u.id);
    if (p) {
      setProfile(p);
    } else {
      setProfile({
        uid: u.id,
        displayName: u.user_metadata?.display_name ?? 'Crew Member',
        avatarColor: u.user_metadata?.avatar_color ?? '#6366f1',
        createdAt: Date.now(),
      });
    }
  };

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    await loadProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
