import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { user_role } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: user_role | null;
  isInitialized: boolean;
  setAuth: (session: Session | null, role: user_role | null) => void;
  setInitialized: (status: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null, user: null, role: null, isInitialized: false,
  setAuth: (session, role) => set({ session, user: session?.user ?? null, role }),
  setInitialized: (status) => set({ isInitialized: status }),
  clearAuth: () => set({ session: null, user: null, role: null }),
}));
