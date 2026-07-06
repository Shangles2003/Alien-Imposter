import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BlockedUser, fetchMyBlocks } from '@/services/moderation';

interface BlockListContextValue {
  blocks: BlockedUser[];
  blockedIds: Set<string>;
  loading: boolean;
  refreshBlocks: () => Promise<void>;
  isBlocked: (uid: string) => boolean;
}

const BlockListContext = createContext<BlockListContextValue>({
  blocks: [],
  blockedIds: new Set(),
  loading: true,
  refreshBlocks: async () => {},
  isBlocked: () => false,
});

export function BlockListProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBlocks = useCallback(async () => {
    if (!user) {
      setBlocks([]);
      setLoading(false);
      return;
    }
    try {
      const list = await fetchMyBlocks();
      setBlocks(list);
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refreshBlocks();
  }, [refreshBlocks]);

  const blockedIds = useMemo(() => new Set(blocks.map((b) => b.blockedId)), [blocks]);

  const isBlocked = useCallback((uid: string) => blockedIds.has(uid), [blockedIds]);

  return (
    <BlockListContext.Provider value={{ blocks, blockedIds, loading, refreshBlocks, isBlocked }}>
      {children}
    </BlockListContext.Provider>
  );
}

export function useBlockList() {
  return useContext(BlockListContext);
}
