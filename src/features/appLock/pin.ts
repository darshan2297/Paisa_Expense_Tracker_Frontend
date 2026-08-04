import * as Crypto from 'expo-crypto';

import * as authApi from '@/features/auth/api';
import { getApiErrorMessage } from '@/utils/errors';
import { secureStorage } from '@/utils/secureStorage';

const PIN_HASH_KEY = 'paisa.appLock.pinHash';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

/**
 * Every SecureStore read/write below is wrapped defensively: an unreadable
 * keychain (corrupted entry, OS-level keychain failure) must fail *closed* —
 * treated the same as "no PIN configured" so the caller routes back into PIN
 * setup rather than crashing or, worse, getting stuck unable to unlock at
 * all. Never rethrow raw SecureStore errors here — they must not end up in
 * a log with the PIN hash attached.
 */

export async function hasPinConfigured(): Promise<boolean> {
  try {
    return (await secureStorage.getItem(PIN_HASH_KEY)) !== null;
  } catch {
    return false;
  }
}

/** Local-only cache write (does not touch the account). Prefer `savePin`. */
export async function setPin(pin: string): Promise<void> {
  try {
    await secureStorage.setItem(PIN_HASH_KEY, await hashPin(pin));
  } catch {
    throw new Error("Couldn't save your PIN on this device. Please try again.");
  }
}

/**
 * Persist the PIN on the account (source of truth) and cache a hash on this
 * device for fast unlock. Use `currentPin` when changing an existing PIN so
 * the server can verify ownership.
 */
export async function savePin(
  pin: string,
  options?: { currentPin?: string; mode?: 'create' | 'change' | 'reset' },
): Promise<void> {
  const mode = options?.mode ?? (options?.currentPin ? 'change' : 'create');
  try {
    if (mode === 'change') {
      if (!options?.currentPin) {
        throw new Error('Current PIN is required to change your PIN.');
      }
      try {
        await authApi.changeAccountPin({ current_pin: options.currentPin, new_pin: pin });
      } catch (err) {
        // Account never had a PIN (legacy device-only) — create instead.
        const message = getApiErrorMessage(err, '');
        if (message.includes('No app PIN')) {
          await authApi.setAccountPin({ pin });
        } else {
          throw err;
        }
      }
    } else {
      await authApi.setAccountPin({ pin });
    }
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Couldn't save your PIN. Please try again."));
  }
  await setPin(pin);
}

/**
 * Verify against the local cache first; if missing/wrong, ask the account
 * API (new browser after login) and cache on success for offline unlock.
 */
export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const storedHash = await secureStorage.getItem(PIN_HASH_KEY);
    if (storedHash && (await hashPin(pin)) === storedHash) {
      // Migrate device-only PINs (pre-account-PIN installs) up to the account
      // once, so other browsers stop asking for setup.
      void migrateLocalPinToAccount(pin);
      return true;
    }
  } catch {
    // Fall through to account verification.
  }

  try {
    const valid = await authApi.verifyAccountPin({ pin });
    if (valid) {
      await setPin(pin);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function migrateLocalPinToAccount(pin: string): Promise<void> {
  try {
    const status = await authApi.getPinStatus();
    if (!status.configured) {
      await authApi.setAccountPin({ pin });
    }
  } catch {
    // Best-effort — unlock must not fail if sync is offline.
  }
}

export async function clearPin(): Promise<void> {
  try {
    await secureStorage.deleteItem(PIN_HASH_KEY);
  } catch {
    // Best-effort: a delete failure here must not block logout/reset flows
    // that call this as one step among several.
  }
}

/** Clear account PIN (after verifying) and wipe the local cache. */
export async function clearAccountAndDevicePin(pin: string): Promise<void> {
  await authApi.clearAccountPin({ pin });
  await clearPin();
}
