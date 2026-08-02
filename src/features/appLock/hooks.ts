import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAppLockStore } from '@/stores/appLockStore';
import { useSessionStore } from '@/stores/sessionStore';

import { isBiometricEnabled } from './biometricPreference';
import { hasPinConfigured } from './pin';

/**
 * Call once, near the app root, alongside `hydrateSession()`. Checks
 * whether a PIN is configured on this device and, if so, starts the app
 * locked - matching the mockup's "Welcome back, {name} · Paisa is locked"
 * screen shown on cold start.
 */
export async function hydrateAppLock(): Promise<void> {
  const { setHasPinConfigured, setBiometricEnabled, setLocked, setHydrating } =
    useAppLockStore.getState();
  try {
    const configured = await hasPinConfigured();
    setHasPinConfigured(configured);
    setBiometricEnabled(await isBiometricEnabled());
    setLocked(configured);
  } catch {
    setHasPinConfigured(false);
    setLocked(false);
  } finally {
    setHydrating(false);
  }
}

/**
 * Re-locks the app whenever it returns to the foreground after being
 * backgrounded - matching the mockup's "Lock the app · Require auth to
 * come back" quick-link copy. Only takes effect once a PIN is actually
 * configured and the user is authenticated (there's nothing to lock
 * otherwise).
 */
export function useRelockOnForeground(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      const cameToForeground = appState.current.match(/inactive|background/) && next === 'active';
      appState.current = next;

      if (!cameToForeground) {
        return;
      }
      const { hasPinConfigured: configured, setLocked } = useAppLockStore.getState();
      const { isAuthenticated } = useSessionStore.getState();
      if (configured && isAuthenticated) {
        setLocked(true);
      }
    });

    return () => subscription.remove();
  }, []);
}
