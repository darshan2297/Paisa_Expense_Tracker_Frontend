import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { clearTokens, getAccessToken, storeTokens } from '@/api/client';
import { useSessionStore } from '@/stores/sessionStore';

import * as authApi from './api';
import type { ChangePasswordPayload, LoginPayload } from './types';

/**
 * Call once, near the app root (see app/_layout.tsx), before rendering any
 * route that depends on auth state. Sets `isAuthenticated` optimistically
 * from whether a token exists locally - see sessionStore's module docstring
 * for why that's good enough for routing purposes.
 *
 * `isHydrating` is guaranteed to end up `false` even if reading the token
 * throws for some unexpected reason - the auth guard in app/_layout.tsx
 * treats `isHydrating: true` as "don't redirect yet", so a stuck `true`
 * would leave every route reachable without authentication forever.
 */
export async function hydrateSession(): Promise<void> {
  const { setAuthenticated, setHydrating } = useSessionStore.getState();
  try {
    const token = await getAccessToken();
    setAuthenticated(Boolean(token));
  } catch {
    setAuthenticated(false);
  } finally {
    setHydrating(false);
  }
}

export function useLogin() {
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokenPair) => {
      await storeTokens(tokenPair.access_token, tokenPair.refresh_token);
      setAuthenticated(true);
      router.replace('/(tabs)');
    },
  });
}

export function useLogout() {
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: authApi.logout,
    // Log out locally even if the network call itself failed (token already
    // invalid, offline, etc.) - there is no safe "stay logged in" outcome
    // once the user has asked to log out.
    onSettled: async () => {
      await clearTokens();
      setAuthenticated(false);
      router.replace('/(auth)/login');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
  });
}
