import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { user_role, Profile } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: user_role | null;
  profile: Profile | null;
  isInitialized: boolean;
  setAuth: (session: Session | null, role: user_role | null, profile: Profile | null) => void;
  setInitialized: (status: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null, user: null, role: null, profile: null, isInitialized: false,
  setAuth: (session, role, profile) => set({
    session,
    user: session?.user ?? null,
    role,
    profile }),
  setInitialized: (status) => set({ isInitialized: status }),
  clearAuth: () => set({ session: null, user: null, role: null, profile: null }),
}));
