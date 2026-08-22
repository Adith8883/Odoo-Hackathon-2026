import { create } from 'zustand';
import type { AuthUser, UserRole } from '@/types/auth.types';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      isLoading: false,
    }),
}));
