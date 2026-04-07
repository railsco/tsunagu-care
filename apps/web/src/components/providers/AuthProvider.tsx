'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getCareManagerByAuthId } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    setUser,
    setCareManager,
    setIsLoading,
    setIsInitialized,
    reset,
  } = useAuthStore();

  const initAuth = useCallback(async () => {
    const supabase = createClient();

    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // ケアマネ情報を取得
        const careManager = await getCareManagerByAuthId(user.id);
        if (careManager) {
          setCareManager(careManager);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [setUser, setCareManager, setIsLoading, setIsInitialized]);

  useEffect(() => {
    initAuth();

    const supabase = createClient();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          const careManager = await getCareManagerByAuthId(session.user.id);
          if (careManager) {
            setCareManager(careManager);
          }
        } else if (event === 'SIGNED_OUT') {
          reset();
          // ダッシュボードにいる場合はログインページへリダイレクト
          if (pathname?.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth, setUser, setCareManager, reset, router, pathname]);

  return <>{children}</>;
}
