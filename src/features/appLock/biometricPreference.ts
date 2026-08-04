import { secureStorage } from '@/utils/secureStorage';

const BIOMETRIC_ENABLED_KEY = 'paisa.appLock.biometricEnabled';

/**
 * Whether the user has opted IN to biometric unlock - distinct from
 * whether the device supports it at all (see `isBiometricAvailable` in
 * ./biometrics.ts). Device support is a capability; this is a preference -
 * a supported device with this off should not offer Fingerprint/Face ID on
 * the lock screen, since the user explicitly skipped or disabled it.
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    return (await secureStorage.getItem(BIOMETRIC_ENABLED_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await secureStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // Best-effort preference write — a failure here should not block the
    // PIN flow it's usually called alongside (see clearDeviceAppLock).
  }
}
