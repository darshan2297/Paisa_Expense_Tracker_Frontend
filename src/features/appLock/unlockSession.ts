import { Platform } from 'react-native';

/**
 * Tab-scoped app-lock session for web.
 *
 * Values in `sessionStorage` (same tab only; cleared when the tab closes):
 * - missing  → fresh visit / after logout — app stays open (no PIN gate)
 * - `1`      → user unlocked (or just signed in) — stay open across refresh
 * - `locked` → user tapped "Lock the app" — show PIN again after refresh
 *
 * Native has no sessionStorage; cold start never auto-locks. Locking is
 * explicit via `setLocked(true)` only.
 */

const UNLOCK_SESSION_KEY = 'paisa.appLock.sessionUnlocked';

const SESSION_UNLOCKED = '1';
const SESSION_LOCKED = 'locked';

function getSessionStorage(): Storage | null {
  if (Platform.OS !== 'web') {
    return null;
  }
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function markAppUnlocked(): void {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(UNLOCK_SESSION_KEY, SESSION_UNLOCKED);
  } catch {
    // Private mode / quota — ignore.
  }
}

/** Record that the user explicitly locked — restore PIN gate after refresh. */
export function markAppLocked(): void {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(UNLOCK_SESSION_KEY, SESSION_LOCKED);
  } catch {
    // ignore
  }
}

export function clearAppUnlockSession(): void {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(UNLOCK_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function hasAppUnlockSession(): boolean {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(UNLOCK_SESSION_KEY) === SESSION_UNLOCKED;
  } catch {
    return false;
  }
}

/** True only after an explicit Lock in this tab (survives refresh). */
export function shouldRestoreLockScreen(): boolean {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(UNLOCK_SESSION_KEY) === SESSION_LOCKED;
  } catch {
    return false;
  }
}
