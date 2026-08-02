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
import { useOnboardingFlowStore } from '@/stores/onboardingFlowStore';
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
 * Central routing guard, run once hydration settles. Three rules, in order:
 *
 * 1. Not authenticated + not already in (auth) -> send to Register (if
 *    bootstrap registration is still open) or Login.
 * 2. Authenticated but no PIN configured yet + not already in onboarding or
 *    mid-flow on (auth)/register|login -> force /onboarding.
 * 3. Authenticated + PIN configured + still stuck in (auth) and not mid-flow
 *    -> send to /(tabs).
 *
 * `onboardingFlowStore.inProgress` keeps the guard from yanking the user to
 * /(tabs) the moment a PIN is saved but before the optional biometric step
 * finishes — all on the same screen as register/login.
 */
function useAuthGuard() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isSessionHydrating = useSessionStore((state) => state.isHydrating);
  const registrationOpen = useSessionStore((state) => state.registrationOpen);
  const hasPinConfigured = useAppLockStore((state) => state.hasPinConfigured);
  const isAppLockHydrating = useAppLockStore((state) => state.isHydrating);
  const onboardingInProgress = useOnboardingFlowStore((state) => state.inProgress);

  useEffect(() => {
    if (isSessionHydrating || isAppLockHydrating) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace(registrationOpen ? '/(auth)/register' : '/(auth)/login');
      }
      return;
    }

    if (!hasPinConfigured) {
      if (!inOnboardingGroup && !inAuthGroup) {
        router.replace('/onboarding');
      }
      return;
    }

    if (inAuthGroup && !onboardingInProgress) {
      router.replace('/(tabs)');
    }
  }, [
    isAuthenticated,
    isSessionHydrating,
    isAppLockHydrating,
    registrationOpen,
    hasPinConfigured,
    onboardingInProgress,
    segments,
    router,
  ]);
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
              {/* onboarding/index.tsx — resume PIN setup if the app was closed mid-flow */}
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
