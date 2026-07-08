import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { SupportedStorage } from '@supabase/supabase-js';

const memory = new Map<string, string>();

/** No-op storage for Node SSR where window/localStorage do not exist. */
const serverStorage: SupportedStorage = {
  getItem: (key) => Promise.resolve(memory.get(key) ?? null),
  setItem: (key, value) => {
    memory.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    memory.delete(key);
    return Promise.resolve();
  },
};

const webStorage: SupportedStorage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

/** Picks the right auth persistence layer per runtime (SSR / web / native). */
export function getAuthStorage(): SupportedStorage {
  if (typeof window === 'undefined') {
    return serverStorage;
  }
  if (Platform.OS === 'web') {
    return webStorage;
  }
  return AsyncStorage;
}
