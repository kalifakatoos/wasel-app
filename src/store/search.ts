import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from './storage';

interface SearchState {
  recent: string[];
  addRecent: (q: string) => void;
  clearRecent: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recent: [],
      addRecent: (q) => {
        const v = q.trim();
        if (!v) return;
        set((s) => ({ recent: [v, ...s.recent.filter((r) => r !== v)].slice(0, 8) }));
      },
      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'wasel.search', storage: zustandStorage }
  )
);
