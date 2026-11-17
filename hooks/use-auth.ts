'use client';

import { createClient } from '@/lib/supabase/client';
import { analytics } from '@/lib/analytics';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role?: string | null;
  chess_username: string | null;
  chess_platform: 'lichess' | 'chesscom' | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: (nextPath?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!profileErr && data) {
          setProfile(data as UserProfile);
        }
      } catch {
        // ignore network error
      }
    },
    [supabase],
  );

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err: unknown) {
        console.error('getInitialSession error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Track Google login if redirected from callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth_login') === 'google') {
        analytics.loginGoogle();
        urlParams.delete('auth_login');
        const query = urlParams.toString();
        const cleanUrl = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      }
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
          analytics.loginGoogle();
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithGoogle = useCallback(
    async (nextPath = '/') => {
      setLoading(true);
      setError(null);
      try {
        const origin =
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : 'https://chesscheese.site';
        const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (oauthError) {
          setError(oauthError.message);
          setLoading(false);
          return { error: oauthError.message };
        }

        return {};
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Ошибка при входе через Google';
        setError(msg);
        setLoading(false);
        return { error: msg };
      }
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
    } catch (err: unknown) {
      console.error('signOut error:', err);
    } finally {
      // Clear all user and profile state completely
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, [supabase]);

  return { user, profile, loading, error, clearError, signInWithGoogle, signOut };
}
