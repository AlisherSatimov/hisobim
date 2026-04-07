import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isLoading: true,
      setSession: (session) =>
        set({ session, user: session?.user ?? null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ session: null, user: null, isLoading: false }),
    }),
    {
      name: 'hisobim-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
