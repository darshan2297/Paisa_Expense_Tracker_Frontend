import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { clearTokens, getAccessToken, storeTokens } from '@/api/client';
import { queryClient } from '@/api/queryClient';
import { clearAppUnlockSession, markAppUnlocked } from '@/features/appLock/unlockSession';
import { hasPinConfigured } from '@/features/appLock/pin';
import { unregisterPushNotifications } from '@/features/notifications/push';
import { useAppLockStore } from '@/stores/appLockStore';
import { useOnboardingFlowStore } from '@/stores/onboardingFlowStore';
import { useSessionStore } from '@/stores/sessionStore';

import * as authApi from './api';
import type { ChangePasswordPayload, LoginPayload, RegisterPayload, TokenPair } from './types';

async function loadRegistrationOpen(): Promise<boolean> {
  try {
    return await authApi.isRegistrationOpen();
  } catch {
    // Backend unreachable — allow register so a wiped DB / first run is not blocked.
    return true;
  }
}

async function clearStaleDeviceSession(): Promise<void> {
  // Drop auth tokens only. Local PIN cache may remain; account PIN is the
  // source of truth and is re-checked on the next sign-in.
  await clearTokens();
  clearAppUnlockSession();
  queryClient.clear();
}

/** Wipe cached queries so a new session never reuses prior ₹0 / 401 leftovers. */
function resetQueryCache(): void {
  queryClient.clear();
}

/**
 * Call once, near the app root (see app/_layout.tsx), before rendering any
 * route that depends on auth state. Validates any stored token against the
 * backend (so a deleted DB user does not leave a ghost session), then checks
 * whether bootstrap registration is still open.
 */
export async function hydrateSession(): Promise<void> {
  const { setAuthenticated, setRegistrationOpen, setHydrating } = useSessionStore.getState();
  try {
    const token = await getAccessToken();
    if (token) {
      const valid = await authApi.sessionIsValid();
      if (valid) {
        setAuthenticated(true);
      } else {
        await clearStaleDeviceSession();
        setAuthenticated(false);
        setRegistrationOpen(await loadRegistrationOpen());
      }
    } else {
      setAuthenticated(false);
      setRegistrationOpen(await loadRegistrationOpen());
    }
  } catch {
    setAuthenticated(false);
    setRegistrationOpen(await loadRegistrationOpen());
  } finally {
    setHydrating(false);
  }
}

type AuthMutationOptions = {
  /**
   * When set, the caller advances the onboarding flow in-place instead of
   * routing. Receives whether the *account* already has a PIN configured.
   */
  onAuthenticated?: (accountPinConfigured: boolean) => void | Promise<void>;
};

function applyAccountPinFlag(tokenPair: TokenPair): void {
  if (tokenPair.pin_configured) {
    useAppLockStore.getState().setHasPinConfigured(true);
    markAppUnlocked();
  }
}

async function afterAuthSuccess(
  tokenPair: TokenPair,
  onAuthenticated?: (accountPinConfigured: boolean) => void | Promise<void>,
): Promise<void> {
  applyAccountPinFlag(tokenPair);

  if (onAuthenticated) {
    await onAuthenticated(Boolean(tokenPair.pin_configured));
    return;
  }

  if (tokenPair.pin_configured) {
    router.replace('/(tabs)');
    return;
  }

  // Account has never set a PIN — require setup (also covers fresh register).
  const localConfigured = await hasPinConfigured();
  router.replace(localConfigured ? '/(tabs)' : '/onboarding');
}

export function useLogin(options?: AuthMutationOptions) {
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokenPair) => {
      await storeTokens(tokenPair.access_token, tokenPair.refresh_token);
      resetQueryCache();
      setAuthenticated(true);
      await afterAuthSuccess(tokenPair, options?.onAuthenticated);
    },
  });
}

export function useRegister(options?: AuthMutationOptions) {
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: async (tokenPair) => {
      await storeTokens(tokenPair.access_token, tokenPair.refresh_token);
      resetQueryCache();
      setAuthenticated(true);
      await afterAuthSuccess(tokenPair, options?.onAuthenticated);
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
    //
    // Local PIN cache stays: account PIN is the source of truth. Clearing
    // local cache here is unnecessary; a new browser has no cache anyway.
    onSettled: async () => {
      await unregisterPushNotifications();
      await clearTokens();
      clearAppUnlockSession();
      resetQueryCache();
      setAuthenticated(false);
      useOnboardingFlowStore.getState().setInProgress(false);
      router.replace('/(auth)/login');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
  });
}
