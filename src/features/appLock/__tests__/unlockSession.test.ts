import { Platform } from 'react-native';

import {
  clearAppUnlockSession,
  hasAppUnlockSession,
  markAppLocked,
  markAppUnlocked,
  shouldRestoreLockScreen,
} from '../unlockSession';

describe('unlockSession', () => {
  const originalPlatform = Platform.OS;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('keeps the app open across refresh after unlock', () => {
    expect(hasAppUnlockSession()).toBe(false);
    expect(shouldRestoreLockScreen()).toBe(false);
    markAppUnlocked();
    expect(hasAppUnlockSession()).toBe(true);
    expect(shouldRestoreLockScreen()).toBe(false);
  });

  it('restores the lock screen after an explicit lock + refresh', () => {
    markAppUnlocked();
    markAppLocked();
    expect(hasAppUnlockSession()).toBe(false);
    expect(shouldRestoreLockScreen()).toBe(true);
  });

  it('clears session state on logout', () => {
    markAppLocked();
    clearAppUnlockSession();
    expect(hasAppUnlockSession()).toBe(false);
    expect(shouldRestoreLockScreen()).toBe(false);
  });

  it('is a no-op on native platforms', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    markAppUnlocked();
    markAppLocked();
    expect(hasAppUnlockSession()).toBe(false);
    expect(shouldRestoreLockScreen()).toBe(false);
  });
});
