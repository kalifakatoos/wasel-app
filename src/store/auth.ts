import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from './storage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  /** رقم الهاتف أثناء خطوة التحقق (قبل اكتمال التسجيل) */
  pendingPhone: string | null;
  hasHydrated: boolean;

  setPendingPhone: (phone: string | null) => void;
  setUser: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      pendingPhone: null,
      hasHydrated: false,

      setPendingPhone: (phone) => set({ pendingPhone: phone }),
      setUser: (user) => set({ user }),
      updateUser: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch }, pendingPhone: null } : {})),
      logout: () => set({ user: null, pendingPhone: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'wasel.auth',
      storage: zustandStorage,
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

/** هل أكمل المستخدم التسجيل (رقم + اسم)؟ */
export const selectIsSignedIn = (s: AuthState) => !!s.user && s.user.name.trim().length > 0;
