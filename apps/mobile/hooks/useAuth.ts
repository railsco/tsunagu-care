import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { getFamilyMemberByAuthId, checkUserRole } from '@/lib/auth';

export function useAuth() {
  const {
    user,
    session,
    familyMember,
    isLoading,
    isInitialized,
    setUser,
    setSession,
    setFamilyMember,
    setIsLoading,
    setIsInitialized,
    reset,
  } = useAuthStore();

  const isSubscribed = useRef(false);

  // 認証状態の初期化
  useEffect(() => {
    if (isSubscribed.current) return;
    isSubscribed.current = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // 家族メンバー情報を取得
          try {
            const member = await getFamilyMemberByAuthId(session.user.id);
            setFamilyMember(member);
          } catch (error) {
            console.error('Failed to fetch family member:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          
          try {
            const member = await getFamilyMemberByAuthId(session.user.id);
            setFamilyMember(member);
          } catch (error) {
            console.error('Failed to fetch family member:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          reset();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      isSubscribed.current = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      reset();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    familyMember,
    careReceiver: familyMember?.care_receiver ?? null,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
    signOut,
  };
}
