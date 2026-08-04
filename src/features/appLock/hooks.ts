import { getPinStatus } from '@/features/auth/api';
import { useAppLockStore } from '@/stores/appLockStore';
import { useSessionStore } from '@/stores/sessionStore';

import { isBiometricEnabled, setBiometricEnabled } from './biometricPreference';
import { clearStaleKeychainFromPriorInstall } from './installGuard';
import { clearPin, hasPinConfigured } from './pin';
import { clearAppUnlockSession, shouldRestoreLockScreen } from './unlockSession';

/**
 * Wipes every device-level App Lock artifact: the PIN hash, the biometric
 * opt-in preference, and the current unlock session. Used when the user
 * explicitly turns PIN lock off in Security — not on logout (logout must
 * keep the local cache; account PIN is the source of truth).
 */
export async function clearDeviceAppLock(): Promise<void> {
  await clearPin();
  await setBiometricEnabled(false);
  clearAppUnlockSession();
  const {
    setHasPinConfigured,
    setBiometricEnabled: setBiometricEnabledState,
    applyHydratedLockState,
  } = useAppLockStore.getState();
  setHasPinConfigured(false);
  setBiometricEnabledState(false);
  // Do not call setLocked(false) here — that would re-mark the unlock session
  // we just cleared.
  applyHydratedLockState(false);
}

/**
 * Call once, near the app root, alongside `hydrateSession()`. Loads whether
 * a PIN exists on this device *or* on the account. The lock screen is restored
 * only if the user explicitly locked earlier in this browser tab.
 */
export async function hydrateAppLock(): Promise<void> {
  const { setHasPinConfigured, setBiometricEnabled, applyHydratedLockState, setHydrating } =
    useAppLockStore.getState();
  try {
    await clearStaleKeychainFromPriorInstall();
    let configured = await hasPinConfigured();
    if (!configured && useSessionStore.getState().isAuthenticated) {
      try {
        const status = await getPinStatus();
        configured = status.configured;
      } catch {
        // Offline / pin endpoint unavailable — fall back to local only.
      }
    }
    setHasPinConfigured(configured);
    setBiometricEnabled(await isBiometricEnabled());
    applyHydratedLockState(configured && shouldRestoreLockScreen());
  } catch {
    setHasPinConfigured(false);
    applyHydratedLockState(false);
  } finally {
    setHydrating(false);
  }
}

// Note: the app deliberately does NOT auto-relock when it returns to the
// foreground. On web, react-native-web maps browser tab switches to AppState
// background/active transitions, which made simply changing tabs kick the
// user to the PIN screen. Locking is explicit only: the "Lock the app"
// action (Profile / Security) calls `setLocked(true)`.
