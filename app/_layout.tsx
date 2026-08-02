import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type PropsWithChildren } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
import { AppLockScreen } from '@/features/appLock/AppLockScreen';
import { hydrateAppLock, useRelockOnForeground } from '@/features/appLock/hooks';
import { hydrateSession } from '@/features/auth/hooks';
import { useAppLockStore } from '@/stores/appLockStore';
import { useSessionStore } from '@/stores/sessionStore';
import { colors } from '@/theme/colors';
import { useAppFonts } from '@/theme/typography';

// Keep the native splash screen up until fonts are ready.
SplashScreen.preventAutoHideAsync();

/**
 * App-wide theme provider.
 *
 * Paisa's design language is light-mode only for now (see `src/theme`), so
 * this just pins the status bar style and lets screens read design tokens
 * directly from `src/theme`. If/when dark mode is designed, this is the
 * seam to introduce a real theme context.
 */
function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      {children}
    </>
  );
}

/**
 * Redirects between the (auth) and (tabs) route groups based on session
 * state - the standard Expo Router auth-guard pattern. Does nothing until
 * `hydrateSession()` (called once below) has resolved, so it never redirects
 * based on the store's default `isAuthenticated: false` before the real
 * SecureStore check has had a chance to run.
 */
function useAuthGuard() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isHydrating = useSessionStore((state) => state.isHydrating);

  useEffect(() => {
    if (isHydrating) {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrating, segments, router]);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isAppLockHydrating = useAppLockStore((state) => state.isHydrating);
  const isLocked = useAppLockStore((state) => state.isLocked);

  useEffect(() => {
    hydrateSession();
    hydrateAppLock();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useAuthGuard();
  useRelockOnForeground();

  if (!fontsLoaded && !fontError) {
    // Native splash screen is still visible — render nothing underneath it.
    return null;
  }

  const showAppLock = isAuthenticated && !isAppLockHydrating && isLocked;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppThemeProvider>
          {showAppLock ? (
            <AppLockScreen />
          ) : (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen
                name="lock-setup"
                options={{ headerShown: true, title: 'Set up app lock', presentation: 'modal' }}
              />
              <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not found' }} />
            </Stack>
          )}
        </AppThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
