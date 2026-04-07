import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import type { FamilyMember, CareReceiver } from '@tsunagu-care/shared';

interface FamilyMemberWithCareReceiver extends FamilyMember {
  care_receiver: Pick<CareReceiver, 'id' | 'name' | 'care_level' | 'birth_date'> | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  familyMember: FamilyMemberWithCareReceiver | null;
  isLoading: boolean;
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setFamilyMember: (familyMember: FamilyMemberWithCareReceiver | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  familyMember: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setFamilyMember: (familyMember) => set({ familyMember }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  reset: () => set({
    user: null,
    session: null,
    familyMember: null,
    isLoading: false,
    isInitialized: false,
  }),
}));
