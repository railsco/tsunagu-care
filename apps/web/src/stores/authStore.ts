import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { CareManager } from '@tsunagu-care/shared';

interface AuthState {
  // 認証状態
  user: User | null;
  careManager: CareManager | null;
  isLoading: boolean;
  isInitialized: boolean;

  // アクション
  setUser: (user: User | null) => void;
  setCareManager: (careManager: CareManager | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  careManager: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setCareManager: (careManager) => set({ careManager }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  reset: () =>
    set({
      user: null,
      careManager: null,
      isLoading: false,
      isInitialized: false,
    }),
}));
