import '../global.css';

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// スプラッシュスクリーンを自動で非表示にしない
SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && !inAuthGroup) {
      // 認証済みで認証グループ外にいる場合、ホームへリダイレクト
      router.replace('/(auth)/home');
    } else if (!isAuthenticated && inAuthGroup) {
      // 未認証で認証グループ内にいる場合、ログイン画面へリダイレクト
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, segments]);
}

export default function RootLayout() {
  const { isInitialized } = useAuth();

  useProtectedRoute();

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <LoadingSpinner message="起動中..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0d9488',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'ログイン',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
