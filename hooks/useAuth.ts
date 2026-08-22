'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getCurrentUser } from '@/services/auth.service';

export function useAuth() {
  const { user, isAuthenticated, isLoading, role, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    getCurrentUser().then((user) => {
      setUser(user);
    }).catch(() => {
      setUser(null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = await getCurrentUser();
        setUser(user);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, logout]);

  return { user, isAuthenticated, isLoading, role };
}
