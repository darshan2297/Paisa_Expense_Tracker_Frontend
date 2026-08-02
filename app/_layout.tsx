import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type PropsWithChildren } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
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

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    // Native splash screen is still visible — render nothing underneath it.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not found' }} />
          </Stack>
        </AppThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
